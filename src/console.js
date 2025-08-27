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
const instances = {}; // stockage des instances utilisateur

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
  console.log('  new <Classe> [nom] {json?}   Crée une instance');
  console.log('  objs / instances             Liste les instances');
  console.log('  call <instance>.methode args...  Appelle méthode instance');
  console.log('  del <instance>               Supprime une instance');
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
  if (!target.includes('.')) throw new Error('Format attendu: module.fonction ou Classe.methode');
  const [lhs, fn] = target.split('.');
  let ref;
  if (registry[lhs]) {
    ref = registry[lhs][fn];
    if (!ref) throw new Error(`Fonction inconnue: ${lhs}.${fn}`);
  } else {
    // essayer classe exportée
    let foundClass;
    for (const mod of Object.values(registry)) {
      if (mod[lhs]) { foundClass = mod[lhs]; break; }
    }
    if (!foundClass) throw new Error(`Module ou classe inconnu: ${lhs}`);
    if (typeof foundClass[fn] === 'function') {
      ref = foundClass[fn]; // statique
    } else if (typeof foundClass.prototype?.[fn] === 'function') {
      // créer instance temporaire auto (best effort)
      try {
        const seed = lhs.includes('Comment') ? { id:'tmp', body:'temp', author:'temp', created:new Date().toISOString() } : { key:'TMP-1', id:'tmp', fields:{ issuetype:{name:'Task'}, status:{name:'New'}, summary:'Temp', description:'Temp', project:{name:'Temp'} } };
        const inst = new foundClass(seed);
        ref = foundClass.prototype[fn].bind(inst);
      } catch {
        throw new Error(`Impossible d'instancier automatiquement ${lhs}. Utilisez new ${lhs} d'abord.`);
      }
    } else {
      throw new Error(`Méthode '${fn}' introuvable sur ${lhs}`);
    }
  }

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
  if (['objs','instances'].includes(trimmed)) { Object.entries(instances).forEach(([n,o])=>console.log(`${n}: ${o.constructor?.name}`)); rl.prompt(); return; }
  if (trimmed.startsWith('del ')) { const name=trimmed.split(/\s+/)[1]; if(instances[name]) { delete instances[name]; console.log('Instance supprimée:', name);} else console.log('Instance inconnue:', name); rl.prompt(); return; }
  if (trimmed.startsWith('new ')) {
    try {
      const parts = trimmed.split(/\s+/).slice(1);
      const className = parts.shift();
      if (!className) throw new Error('Classe requise');
      let foundClass; for (const mod of Object.values(registry)) { if (mod[className]) { foundClass = mod[className]; break; } }
      if (!foundClass) throw new Error(`Classe inconnue: ${className}`);
      let name = parts[0] && !parts[0].startsWith('{') ? parts.shift() : undefined;
      if (!name) { let i=1; while(instances['obj'+i]) i++; name='obj'+i; }
      let jsonArg = parts.join(' '); let payload={}; if (jsonArg) { try { payload=JSON.parse(jsonArg);} catch { console.warn('JSON invalide, objet vide.'); } }
      if (className === 'JiraIssue') {
        payload = Object.assign({ key:'TMP-1', id:Date.now().toString(), fields:{ issuetype:{name:'Task'}, status:{name:'New'}, summary:'Temp issue', description:'Temp desc', project:{name:'TempProj'} } }, payload);
      } else if (className === 'JiraComment') {
        payload = Object.assign({ id:Date.now().toString(), body:'Temp body', author:'Temp', created:new Date().toISOString() }, payload);
      }
      const inst = new foundClass(payload);
      instances[name]=inst;
      console.log(color.green(`Instance créée: ${name}`));
    } catch(e) { console.error(color.red('Erreur:'), e.message); }
    rl.prompt(); return;
  }
  if (trimmed.startsWith('call ')) {
    try {
      const expr = trimmed.slice(5).trim();
      if (!expr.includes('.')) throw new Error('Format: call <instance>.<methode> [args...]');
      const [head, ...rest] = expr.split(/\s+/);
      const [instName, method] = head.split('.');
      const obj = instances[instName]; if (!obj) throw new Error(`Instance inconnue: ${instName}`);
      const fn = obj[method]; if (typeof fn !== 'function') throw new Error(`Méthode inconnue: ${method}`);
      const args = rest.map(t=>{ try { return JSON.parse(t);} catch { return t.replace(/^"|"$/g,''); } });
      const out = await fn.apply(obj, args);
      if (out !== undefined) console.log(color.cyan('Résultat:'), util.inspect(out,{depth:5,colors:true}));
    } catch(e) { console.error(color.red('Erreur:'), e.message); }
    rl.prompt(); return;
  }

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
