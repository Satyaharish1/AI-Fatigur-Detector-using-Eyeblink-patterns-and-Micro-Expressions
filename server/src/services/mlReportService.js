import fs from 'fs';
import path from 'path';

const workspaceRoot = path.resolve(process.cwd(), '..');
const modelsDir = path.join(workspaceRoot, 'ml', 'models');

function readJsonIfExists(fileName) {
  const fullPath = path.join(modelsDir, fileName);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { error: `Failed to parse ${fileName}` };
  }
}

export function getMlReports() {
  return {
    trainingReport: readJsonIfExists('training_report.json'),
    featureImportance: readJsonIfExists('feature_importance.json'),
    sequenceTrainingReport: readJsonIfExists('sequence_training_report.json'),
    manifest: readJsonIfExists('model_manifest.json')
  };
}
