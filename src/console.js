/*
 * T.W.I.N - Interactive Utils Console
 *
 *   Lancer: npm run console (ou node src/server.js --console)
 *   Objectif: tester rapidement les fonctions utilitaires sans démarrer Express.
 *
 *   Commandes:
 *     help                -> Affiche l'aide
 *     list                -> Liste modules et fonctions disponibles
 *     mod.func arg1 arg2  -> Appelle une fonction (args JSON si possible sinon string)
 *     exit / quit         -> Quitter
 *
 *   Exemples:
 *     env.getEnvVar "PORT"
 *     env.updateEnvVars '{"LOG_LEVEL":"debug"}'
 *     logs.getLogFiles
 *     logs.readLogFile "combined.log" '{"lines":10,"tail":true}'
 */

const readline = require('readline');
const util = require('util');
const logger = require('./config/logger');

// Charger modules utils
const env = require('./utils/envManager');
const logs = require('./utils/logManager');
const jira = require('./utils/jiraManager');
let data;
try { data = require('./utils/dataManager'); } catch { data = {}; }

const registry = { env, logs, jira, data };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'TWIN> '
});

const color = {
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`
};

function printHelp() {
  console.log(`\n${color.cyan('Aide Console Utils T.W.I.N')}\n`);
  console.log('Commandes:');
  console.log('  help              Affiche cette aide');
  console.log('  list              Liste modules / fonctions exportées');
  console.log('  list <Nom>        Liste les méthodes d\'une classe/fonctions dans tous les modules');
  console.log('  <mod>.<func> ...  Appelle une fonction. Arguments séparés par espaces.');
  console.log('                    Chaque argument est tenté en JSON.parse sinon string.');
  console.log('  exit | quit       Quitter');
  console.log('\nExemples:');
  console.log('  env.getEnvVar "PORT"');
  console.log('  env.updateEnvVars {"LOG_LEVEL":"debug"}');
  console.log('  logs.readLogFile "combined.log" {"lines":5,"tail":true}');
  console.log('');
}

function listFunctions() {
  Object.entries(registry).forEach(([modName, mod]) => {
    const fns = Object.keys(mod)
      .filter(k => typeof mod[k] === 'function')
      .sort();
    console.log(`${color.yellow(modName)}: ${fns.join(', ') || '(aucune fonction exportée)'}`);
  });
}

function listEntity(name) {
  const matches = [];
  for (const [modName, mod] of Object.entries(registry)) {
    if (mod[name]) {
      matches.push({ modName, entity: mod[name] });
    }
  }
  if (matches.length === 0) {
    console.log(color.red(`Aucune entité nommée '${name}' trouvée.`));
    return;
  }
  matches.forEach(({ modName, entity }) => {
    console.log(color.yellow(`Module ${modName} :: ${name}`));
    if (typeof entity === 'function') {
      // Supposé classe ou fonction. Pour classe on liste prototype.
      const proto = entity.prototype || {};
      const methods = Object.getOwnPropertyNames(proto)
        .filter(m => m !== 'constructor' && typeof proto[m] === 'function');
      if (methods.length) {
        methods.forEach(m => console.log('  -', m + '()'));
      } else {
        console.log('  (aucune méthode d\'instance)');
      }
      // Méthodes statiques
      const staticMethods = Object.getOwnPropertyNames(entity)
        .filter(k => !['length','name','prototype'].includes(k) && typeof entity[k] === 'function');
      if (staticMethods.length) {
        console.log('  Méthodes statiques:');
        staticMethods.forEach(sm => console.log('    *', sm + '()'));
      }
    } else if (entity && typeof entity === 'object') {
      const keys = Object.keys(entity);
      keys.forEach(k => console.log('  - propriété:', k));
    } else {
      console.log('  (type non inspectable)');
    }
  });
}

async function invoke(line) {
  const [target, ...argTokens] = line.trim().split(/\s+/);
  if (!target) return;
  if (!target.includes('.')) throw new Error('Format attendu: module.fonction');
  const [mod, fn] = target.split('.');
  if (!registry[mod]) throw new Error(`Module inconnu: ${mod}`);
  const ref = registry[mod][fn];
  if (!ref) throw new Error(`Fonction inconnue: ${mod}.${fn}`);

  const args = argTokens.map(tok => {
    if (!tok) return tok;
    try { return JSON.parse(tok); } catch { return tok.replace(/^"|"$/g, ''); }
  }).filter(v => v !== undefined);

  const isAsync = ref.constructor.name === 'AsyncFunction';
  const result = isAsync ? await ref(...args) : ref(...args);
  return result;
}

console.log(color.green('=== Console interactive Utils T.W.I.N ==='));
printHelp();
rl.prompt();

rl.on('line', async line => {
  const trimmed = line.trim();
  if (!trimmed) { rl.prompt(); return; }
  if (['exit', 'quit'].includes(trimmed)) { rl.close(); return; }
  if (trimmed === 'help') { printHelp(); rl.prompt(); return; }
  if (trimmed === 'list') { listFunctions(); rl.prompt(); return; }
  if (trimmed.startsWith('list ')) { listEntity(trimmed.split(/\s+/)[1]); rl.prompt(); return; }

  try {
    const output = await invoke(trimmed);
    if (output !== undefined) {
      console.log(color.cyan('Résultat:'), util.inspect(output, { depth: 5, colors: true }));
    } else {
      console.log(color.cyan('Aucune sortie.'));
    }
  } catch (err) {
    console.error(color.red('Erreur:'), err.message);
  }
  rl.prompt();
}).on('close', () => {
  console.log(color.green('Au revoir 👋'));
  process.exit(0);
});
