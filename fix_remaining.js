const fs = require('fs');

function fixCurriculumService() {
  const p = 'lib/services/curriculum-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/estimated_minutes: number \| undefined/g, 'estimated_minutes: number | null');
  c = c.replace(/day_number: number \| undefined/g, 'day_number: number | null');
  c = c.replace(/day_number\?: number/g, 'day_number?: number | null');
  c = c.replace(/estimated_minutes\?: number/g, 'estimated_minutes?: number | null');
  fs.writeFileSync(p, c);
}

function fixRagRetriever() {
  const p = 'lib/rag/retriever.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/plan\.title/g, '(plan as any).title');
  c = c.replace(/plan\.goal_summary/g, '(plan as any).goal_summary');
  fs.writeFileSync(p, c);
}

fixCurriculumService();
fixRagRetriever();
