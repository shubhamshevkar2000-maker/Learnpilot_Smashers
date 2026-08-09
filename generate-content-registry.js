import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'content-registry.json');
const registryJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let out = `import type { ActivityType } from "@/types/database.types"

export interface ContentPayload {
  id: string
  title: string
  type: ActivityType
  objective: string
  concept_guide?: string
  code_example?: string
  practical_exercise?: string
  checkpoint_question?: string
  checkpoint_options?: string[]
  checkpoint_correct_index?: number
  checkpoint_explanation?: string
  topic?: string
  skill?: string
  difficulty?: string
}

export const CONTENT_REGISTRY: Record<string, ContentPayload> = {
`;

for (const [key, value] of Object.entries(registryJson)) {
  out += `  "${key}": ${JSON.stringify(value, null, 4).replace(/\n/g, '\n  ')},\n`;
}

out += `};\n`;

const targetPath = path.join(process.cwd(), 'lib/generator/content-registry.ts');
fs.writeFileSync(targetPath, out, 'utf8');
console.log("Successfully created lib/generator/content-registry.ts");
