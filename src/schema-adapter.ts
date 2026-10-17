/**
 * @intuitui-labs/a11y-gate - Schema & Field Affordance Adapter
 *
 * Connects concrete form schemas (e.g. @intuitui-labs/form-builder-engine)
 * and AST representations to a11y-gate without requiring manual telemetry numbers.
 */

import {
  auditAffordanceDiversity,
  type FormFieldModality,
  type AffordanceDiversityResult,
} from './hotspot-diversity.js';

export interface FormSchemaField {
  id?: string;
  name: string;
  type: string; // e.g. 'text' | 'email' | 'select' | 'slider' | 'date' | etc.
  label?: string;
  semanticIntent?: string;
  autoComplete?: string;
  required?: boolean;
}

export interface FormStepSchema {
  stepId: string;
  title?: string;
  fields: FormSchemaField[];
  isCohesiveSemanticGroup?: boolean; // e.g. address blocks, credential blocks
  minAdqThreshold?: number;
  maxConsecutiveMonotonyThreshold?: number;
}

export interface SchemaAffordanceAuditResult {
  stepId: string;
  passes: boolean;
  totalFields: number;
  diversity: AffordanceDiversityResult;
  inputPurposeCompliance: {
    totalSensitiveFields: number;
    missingSemanticIntentFields: string[];
    isCompliant: boolean;
  };
  advisories: string[];
}

/**
 * Maps standard field type string to an interaction modality.
 */
export function mapFieldTypeToModality(fieldType: string): FormFieldModality {
  const t = fieldType.toLowerCase().trim();
  switch (t) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
    case 'textarea':
    case 'phone':
    case 'tel':
    case 'url':
      return 'text-typing';

    case 'select':
    case 'multiselect':
    case 'radio':
    case 'checkbox':
    case 'pills':
    case 'chip':
      return 'tap-pill';

    case 'slider':
    case 'range':
    case 'likert':
      return 'scrubbing-slider';

    case 'date':
    case 'time':
    case 'datetime':
    case 'datetime-local':
      return 'date-preset';

    case 'search':
    case 'combobox':
    case 'picker-search':
    case 'autocomplete':
      return 'picker-search';

    case 'file':
    case 'attachment':
    case 'image-capture':
    case 'audio-record':
      return 'attachment';

    case 'stepper':
    case 'counter':
      return 'stepper';

    default:
      return 'custom';
  }
}

/**
 * Audits a real form step schema for affordance diversity and WCAG 1.3.5 Input Purpose identification.
 * Automatically handles standard address and auth groups without false-positive failures.
 */
export function auditFormSchemaAffordance(step: FormStepSchema): SchemaAffordanceAuditResult {
  const fields = step.fields ?? [];
  const modalities = fields.map((f) => mapFieldTypeToModality(f.type));

  // Auto-detect cohesive groups (e.g. standard address or auth forms)
  const isAddressStep = fields.some(
    (f) =>
      f.name.toLowerCase().includes('address') ||
      f.name.toLowerCase().includes('postal') ||
      f.name.toLowerCase().includes('zip') ||
      f.name.toLowerCase().includes('city')
  );
  const isAuthStep = fields.some(
    (f) =>
      f.name.toLowerCase().includes('password') ||
      f.name.toLowerCase().includes('username') ||
      f.name.toLowerCase().includes('email')
  );
  const isCohesive = step.isCohesiveSemanticGroup ?? (isAddressStep || isAuthStep);

  const diversity = auditAffordanceDiversity({
    stepId: step.stepId,
    fieldModalities: modalities,
    minAdqThreshold: step.minAdqThreshold,
    maxConsecutiveMonotonyThreshold: step.maxConsecutiveMonotonyThreshold,
    minFieldsForSuppressionHazard: 6,
    isCohesiveSemanticGroup: isCohesive,
  });

  // Check WCAG 2.1 SC 1.3.5 (Identify Input Purpose)
  const sensitiveFieldNames = [
    'email',
    'password',
    'name',
    'phone',
    'tel',
    'address',
    'postal',
    'zip',
    'card',
  ];

  const missingSemanticIntentFields: string[] = [];
  let totalSensitive = 0;

  for (const f of fields) {
    const isSensitive = sensitiveFieldNames.some((s) => f.name.toLowerCase().includes(s));
    if (isSensitive) {
      totalSensitive++;
      if (!f.semanticIntent && !f.autoComplete) {
        missingSemanticIntentFields.push(f.name);
      }
    }
  }

  const advisories: string[] = [];
  if (diversity.violation) {
    advisories.push(diversity.violation);
  }
  if (missingSemanticIntentFields.length > 0) {
    advisories.push(
      `[WCAG 1.3.5 Advisory] Fields (${missingSemanticIntentFields.join(', ')}) lack explicit semanticIntent or autoComplete attributes for browser/OS autofill.`
    );
  }

  return {
    stepId: step.stepId,
    passes: diversity.passes,
    totalFields: fields.length,
    diversity,
    inputPurposeCompliance: {
      totalSensitiveFields: totalSensitive,
      missingSemanticIntentFields,
      isCompliant: missingSemanticIntentFields.length === 0,
    },
    advisories,
  };
}
