const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),handlers={};
const node=q=>{if(!nodes.has(q))nodes.set(q,{innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,focus(){},setAttribute(){},addEventListener(){},classList:{toggle(){}},showModal(){},close(){}});return nodes.get(q);};
const ctx=vm.createContext({console,setInterval,clearInterval,requestAnimationFrame(){},matchMedia:()=>({matches:true}),location:{hash:''},document:{querySelector:node,body:{classList:{toggle(){}}},addEventListener:(e,f)=>(handlers[e]??=[]).push(f)},window:{addEventListener(){},scrollTo(){},LESSONS:null},innerWidth:1280,innerHeight:900});
for(const f of ['data.js','app.js','expanded.js','public-source.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const run=s=>vm.runInContext(s,ctx),act=(action,item,more={})=>run(`action({dataset:${JSON.stringify({action,item:String(item),...more})}})`),input=t=>handlers.input.forEach(f=>f({target:t}));
const lessons=run('LESSONS').filter(l=>!process.argv.slice(2).length||process.argv.slice(2).includes(l.id));let watched=0,mcqs=0,open=0,readSections=0;
for(const l of lessons){
 const e=l.enrichment;assert(e,l.id+' missing expansion');assert(fs.existsSync(l.photo.src));assert.equal(l.photo.kind,'generated');assert(e.goals.length>=3);assert(e.sections.length>=4);assert(e.evidence.length>=1);assert.equal(e.watch.length,2);assert(l.vocab.length>=5);assert.equal(l.questions.filter(q=>q.type==='mcq').length,6);assert.equal(l.questions.filter(q=>q.type==='open').length,2);
 const refs=[...e.sections,...e.evidence,...e.misconceptions,...e.watch,e.labGuide.check,e.apply,...l.questions];
 for(const x of refs){assert(Number.isInteger(x.page)&&x.page>=l.page&&x.page<=l.endPage,l.id+' invalid source page');if(x.options){assert(x.correct>=0&&x.correct<x.options.length,l.id+' invalid answer');assert(new Set(x.options).size===x.options.length,l.id+' duplicate options');assert(x.explanation);}}
 for(const sec of e.sections){assert(sec.points.length>=3);assert(sec.points.every(p=>p.length>15));readSections++;}
 run(`active='${l.id}';part=0;render()`);assert(node('#bookContent').innerHTML.includes(l.title));assert(node('#bookContent').innerHTML.includes(l.photo.src));assert.equal((node('#partTabs').innerHTML.match(/data-part=/g)||[]).length,4);assert.equal((node('#bookContent').innerHTML.match(/data-reading=/g)||[]).length,e.sections.length);
 act('sourcePage',l.page);assert.equal(node('#sourceImage').hidden,true);assert(node('#sourceNotice').textContent.includes(run('ar('+l.page+')')));act('closeSource',0);act('word',0,{word:'1'});assert.equal(run('state().vocab'),1);assert(node('#bookContent').innerHTML.includes(l.vocab[1].meaning));
 act('part',0,{part:'1'});assert(node('#bookContent').innerHTML.includes('أشاهد وأقرر'));
 for(const [i,c] of e.watch.entries()){
  act('watchScene',i);act('watchChoice',(c.correct+1)%c.options.length);assert.notEqual(run('state().watchAnswers[state().watchAt]'),c.correct);act('watchChoice',c.correct);assert(node('#bookContent').innerHTML.includes(c.explanation));input({id:'watchReason',dataset:{},value:'تعليل تجريبي للمراجعة'});assert.equal(run('state().watchReasons[state().watchAt]'),'تعليل تجريبي للمراجعة');watched++;
 }
 act('part',0,{part:'2'});assert.equal((node('#bookContent').innerHTML.match(/<svg/g)||[]).length,1);assert(node('#bookContent').innerHTML.includes(e.labGuide.check.prompt));
 const a=l.lab;
 if(a.kind==='classify')a.items.forEach((x,i)=>{act('card',i);act('category',x.category);});
 if(a.kind==='match')a.pairs.forEach((x,i)=>{act('matchLeft',i);act('matchRight',i);});
 if(['sequence','funeral'].includes(a.kind)){act('sequenceCheck',0);assert(!run('state().good'));a.steps.forEach((x,i)=>act('sequenceAdd',i));act('sequenceCheck',0);assert(run('state().good'));}
 if(a.kind==='decisions')a.cases.forEach((c,i)=>{act('case',i);act('decision',c.choices.findIndex(c=>c.correct));});
 if(a.kind==='wage'){act('payment',60);act('wageCheck',0);assert(!run('state().good'));act('payment',100);act('wageCheck',0);assert(run('state().good'));}
 if(a.kind==='fitr'){input({id:'fitrGuess',dataset:{},value:'14'});act('fitrCheck',0);assert(!run('fitrState().fitrSolved'));input({id:'fitrGuess',dataset:{},value:'15'});act('fitrCheck',0);assert(run('fitrState().fitrSolved'));act('fitrWhen',2);act('fitrCheck',0);assert(!run('fitrState().fitrSolved'));act('fitrWhen',0);act('fitrCheck',0);assert(run('fitrState().fitrSolved'));}
 if(a.kind==='care')a.actions.forEach((x,i)=>act('care',i));
 if(a.kind==='eid_prayer'){[6,5].forEach((n,i)=>{for(let j=0;j<n;j++)act('counter',i,{delta:'1'});});act('eidCheck',0);assert(run('state().good'));}
 if(a.kind==='rain'){act('rainStage',4);[2,1,1].forEach((v,i)=>act('rainChoice',i,{value:String(v)}));act('rainCheck',0);assert(run('state().good'));}
 if(a.kind==='eclipse'){act('align',0);act('eclipseMode',1);run('updateModelOnly()');assert.equal(node('#modelCaption').textContent,node('#labFeedback').textContent);}
 if(a.kind==='eclipse_prayer')act('prayerStep',8);
 assert(run('progress()[0]===progress()[1]'),l.id+' activity incomplete');
 act('labTest',(e.labGuide.check.correct+1)%3);assert(node('#bookContent').innerHTML.includes('أراجع التجربة'));act('labTest',e.labGuide.check.correct);assert.equal(run('state().labTest'),e.labGuide.check.correct);
 input({id:'labReflection',dataset:{},value:'تفسير النتيجة'});assert.equal(run('state().labReflection'),'تفسير النتيجة');act('resetLab',0);assert.equal(run('progress()[0]'),a.kind==='eclipse_prayer'?1:0);assert.equal(run('state().watchAnswers.length'),2);
 act('part',0,{part:'3'});assert.equal((node('#bookContent').innerHTML.match(/class="quiz-card"/g)||[]).length,2);const qs=l.questions.filter(q=>q.type==='mcq');
 for(let page=0;page<3;page++){act('quizPage',page);qs.slice(page*2,page*2+2).forEach((q,j)=>{act('quiz',0,{q:String(page*2+j),answer:String(q.correct)});mcqs++;});}
 assert(node('#bookContent').innerHTML.includes('٦ / ٦'));
 for(let i=0;i<2;i++){input({id:'writtenAnswer-'+i,dataset:{written:String(i)},value:'إجابة للمراجعة'});act('openModel',i);assert(run(`state().showModels[${i}]`));assert(node('#bookContent').innerHTML.includes(l.questions.filter(q=>q.type==='open')[i].model));open++;}
 input({id:'applicationPlan',dataset:{},value:'خطة تطبيق الدرس'});assert.equal(run('state().plan'),'خطة تطبيق الدرس');for(const f of handlers.change)f({target:{dataset:{criterion:'0'},checked:true}});assert(run('state().criteria.includes(0)'));
 act('resetQuiz',0);assert.equal(run('state().quiz.length'),0);assert.equal(run('state().quizPage'),0);assert.equal(run('state().plan'),'');
 assert(!node('#bookContent').innerHTML.includes('undefined'));assert(!node('#bookContent').innerHTML.includes('NaN'));
}
console.log(JSON.stringify({lessons:lessons.length,stagesPerLesson:4,readSections,watchDecisionPaths:watched,labActivities:lessons.length,labChecks:lessons.length,mcqs,openResponses:open,resetsAndStateIsolation:'passed',scope:'Node render and interaction tests; not browser layout or physical-device testing.'},null,2));
