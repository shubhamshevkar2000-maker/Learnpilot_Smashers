import os
import re

def resolve_all():
    pattern = re.compile(r'<<<<<<< (ours|HEAD|Updated upstream)\n(.*?)^=======\n(.*?)^>>>>>>> (theirs|Stashed changes)\n?', re.MULTILINE | re.DOTALL)
    
    def process_file(path):
        if not os.path.exists(path): return
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '<<<<<<<' not in content:
            return
            
        def replacer(match):
            ours = match.group(2)
            theirs = match.group(3)
            
            # courses-service: we want ours for the first part, but we want to remove the hardcoded courses
            if 'courses-service.ts' in path:
                if 'domain: "data_analytics"' in ours:
                    return ours
                if 'DOMAIN 1: DATA ANALYTICS' in ours:
                    return ours.replace('lesson_type:', 'activity_type:')
                if 'Storage key helper' in ours:
                    theirs = theirs.replace('difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      lessons', 'difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      domain: "general",\n      lessons')
                    return theirs + ours
                return ours
                
            # plan-generator
            if 'plan-generator.ts' in path:
                if 'day_number: number' in ours:
                    return '  day_number: number\n  content_id?: string\n'
                if 'Target-Date Aware' in ours:
                    helpers = theirs.split('export function generateLearningPlan')[0]
                    if 'export function generateLearningPlan' in ours:
                        ours_body = ours.split('export function generateLearningPlan')[1]
                        return helpers + 'export function generateLearningPlan' + ours_body
                    return helpers + ours
                if 'const lowerGoal' in ours:
                    return ours
                return ours
                
            # notes-service: keep theirs if ours is empty, else combine
            if 'notes-service.ts' in path:
                return ours + "\n" + theirs
                
            # For everything else (app/, types/, etc), we keep ours (our Phase 3.5 work)
            return ours
            
        resolved = pattern.sub(replacer, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(resolved)
        print(f"Resolved {path}")

    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.json')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    resolve_all()
