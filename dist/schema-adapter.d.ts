/**
 * @intuitui-labs/a11y-gate - Schema & Field Affordance Adapter
 *
 * Connects concrete form schemas (e.g. @intuitui-labs/form-builder-engine)
 * and AST representations to a11y-gate without requiring manual telemetry numbers.
 */
import { type FormFieldModality, type AffordanceDiversityResult } from './hotspot-diversity.js';
export interface FormSchemaField {
    id?: string;
    name: string;
    type: string;
    label?: string;
    semanticIntent?: string;
    autoComplete?: string;
    required?: boolean;
}
export interface FormStepSchema {
    stepId: string;
    title?: string;
    fields: FormSchemaField[];
    isCohesiveSemanticGroup?: boolean;
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
export declare function mapFieldTypeToModality(fieldType: string): FormFieldModality;
/**
 * Audits a real form step schema for affordance diversity and WCAG 1.3.5 Input Purpose identification.
 * Automatically handles standard address and auth groups without false-positive failures.
 */
export declare function auditFormSchemaAffordance(step: FormStepSchema): SchemaAffordanceAuditResult;
