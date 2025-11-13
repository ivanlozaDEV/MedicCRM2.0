#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming MCP folder is at project root
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

interface ProjectStructure {
  type: "file" | "directory";
  name: string;
  path: string;
  children?: ProjectStructure[];
}

interface ModelInfo {
  name: string;
  file: string;
  description: string;
  fields?: string[];
}

interface RouteInfo {
  name: string;
  file: string;
  blueprint: string;
  description: string;
}

/**
 * DoctorCRM MCP Server
 * Provides tools for exploring and understanding the DoctorCRM 2.0 project structure
 */
class DoctorCRMServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "doctorcrm-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_project_structure":
            return await this.getProjectStructure(args as { depth?: number });
          
          case "list_models":
            return await this.listModels();
          
          case "get_model_details":
            return await this.getModelDetails(args as { modelName: string });
          
          case "list_routes":
            return await this.listRoutes();
          
          case "get_route_details":
            return await this.getRouteDetails(args as { routeName: string });
          
          case "get_database_schema":
            return await this.getDatabaseSchema();
          
          case "search_in_project":
            return await this.searchInProject(args as { query: string; fileType?: string });
          
          case "get_api_endpoints":
            return await this.getAPIEndpoints();
          
          case "get_tech_stack":
            return await this.getTechStack();
          
          case "get_fhir_compliance":
            return await this.getFHIRCompliance();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "get_project_structure",
        description: "Get the complete folder and file structure of DoctorCRM 2.0 project",
        inputSchema: {
          type: "object",
          properties: {
            depth: {
              type: "number",
              description: "Maximum depth to traverse (default: unlimited)",
            },
          },
        },
      },
      {
        name: "list_models",
        description: "List all database models (SQLAlchemy) with brief descriptions",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_model_details",
        description: "Get detailed information about a specific model including fields, relationships, and FHIR compliance",
        inputSchema: {
          type: "object",
          properties: {
            modelName: {
              type: "string",
              description: "Name of the model (e.g., 'Patient', 'User', 'Organization')",
            },
          },
          required: ["modelName"],
        },
      },
      {
        name: "list_routes",
        description: "List all Flask API routes/blueprints available in the backend",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_route_details",
        description: "Get detailed information about a specific route including endpoints and methods",
        inputSchema: {
          type: "object",
          properties: {
            routeName: {
              type: "string",
              description: "Name of the route (e.g., 'patients', 'auth', 'users')",
            },
          },
          required: ["routeName"],
        },
      },
      {
        name: "get_database_schema",
        description: "Get the complete database schema with all tables, relationships, and key fields",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_in_project",
        description: "Search for files or content within the project",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (file name or content pattern)",
            },
            fileType: {
              type: "string",
              description: "File extension to filter by (e.g., 'py', 'ts', 'tsx')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_api_endpoints",
        description: "Get a comprehensive list of all REST API endpoints with their methods and purposes",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_tech_stack",
        description: "Get complete technology stack information for backend and frontend",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_fhir_compliance",
        description: "Get information about FHIR R4 compliance and implementation in the project",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ];
  }

  private async getProjectStructure(args: { depth?: number }) {
    const maxDepth = args.depth || Infinity;
    
    const buildStructure = (dir: string, currentDepth: number = 0): ProjectStructure[] => {
      if (currentDepth >= maxDepth) return [];
      
      const items: ProjectStructure[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules, __pycache__, .git, build folders
        if (["node_modules", "__pycache__", ".git", "build", ".next"].includes(entry.name)) {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        
        if (entry.isDirectory()) {
          items.push({
            type: "directory",
            name: entry.name,
            path: relativePath,
            children: buildStructure(fullPath, currentDepth + 1),
          });
        } else {
          items.push({
            type: "file",
            name: entry.name,
            path: relativePath,
          });
        }
      }
      
      return items.sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    };

    const structure = buildStructure(PROJECT_ROOT);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(structure, null, 2),
        },
      ],
    };
  }

  private async listModels() {
    const models: ModelInfo[] = [
      {
        name: "Organization",
        file: "backend/models/organization.py",
        description: "Multi-tenant organizations with branding and color palettes",
      },
      {
        name: "User",
        file: "backend/models/user.py",
        description: "System users with medical credentials and authentication",
      },
      {
        name: "Subscription",
        file: "backend/models/subscription.py",
        description: "LemonSqueezy integration for subscription management",
      },
      {
        name: "Role",
        file: "backend/models/role.py",
        description: "User roles (5 system roles + custom roles)",
      },
      {
        name: "Permission",
        file: "backend/models/permission.py",
        description: "Granular permissions (120 total) for RBAC",
      },
      {
        name: "Specialty",
        file: "backend/models/specialty.py",
        description: "Medical specialties (39 predefined) with icons",
      },
      {
        name: "Patient",
        file: "backend/models/patient.py",
        description: "FHIR-compliant patient records with demographics",
      },
      {
        name: "PatientContact",
        file: "backend/models/patient_contact.py",
        description: "Emergency contacts and relationships",
      },
      {
        name: "Allergy",
        file: "backend/models/allergy.py",
        description: "Allergy catalog (food, medication, environmental)",
      },
      {
        name: "PatientAllergy",
        file: "backend/models/patient_allergy.py",
        description: "Patient-specific allergies with severity",
      },
      {
        name: "Medication",
        file: "backend/models/medication.py",
        description: "Medication catalog with dosage info",
      },
      {
        name: "PatientMedication",
        file: "backend/models/patient_medication.py",
        description: "Active patient medications with prescriptions",
      },
      {
        name: "Condition",
        file: "backend/models/condition.py",
        description: "Medical conditions catalog (ICD-10 aligned)",
      },
      {
        name: "PatientCondition",
        file: "backend/models/patient_condition.py",
        description: "Patient diagnoses and conditions",
      },
      {
        name: "RolePermission",
        file: "backend/models/role_permission.py",
        description: "Many-to-many relationship: Role ↔ Permission",
      },
      {
        name: "UserRole",
        file: "backend/models/user_role.py",
        description: "Many-to-many relationship: User ↔ Role",
      },
      {
        name: "UserSpecialty",
        file: "backend/models/user_specialty.py",
        description: "Many-to-many relationship: User ↔ Specialty",
      },
    ];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(models, null, 2),
        },
      ],
    };
  }

  private async getModelDetails(args: { modelName: string }) {
    const modelPath = path.join(
      PROJECT_ROOT,
      "backend",
      "models",
      `${args.modelName.toLowerCase()}.py`
    );

    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model '${args.modelName}' not found`);
    }

    const content = fs.readFileSync(modelPath, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Model: ${args.modelName}\nFile: ${modelPath}\n\n${content}`,
        },
      ],
    };
  }

  private async listRoutes() {
    const routes: RouteInfo[] = [
      {
        name: "auth",
        file: "backend/routes/auth.py",
        blueprint: "auth_bp",
        description: "Authentication endpoints (login, signup, JWT)",
      },
      {
        name: "organizations",
        file: "backend/routes/organizations.py",
        blueprint: "organizations_bp",
        description: "Organization CRUD and management",
      },
      {
        name: "users",
        file: "backend/routes/users.py",
        blueprint: "users_bp",
        description: "User management and profiles",
      },
      {
        name: "subscriptions",
        file: "backend/routes/subscriptions.py",
        blueprint: "subscriptions_bp",
        description: "Subscription plans and billing",
      },
      {
        name: "roles",
        file: "backend/routes/roles.py",
        blueprint: "roles_bp",
        description: "Role management (system + custom)",
      },
      {
        name: "permissions",
        file: "backend/routes/permissions.py",
        blueprint: "permissions_bp",
        description: "Permission listing and management",
      },
      {
        name: "specialties",
        file: "backend/routes/specialties.py",
        blueprint: "specialties_bp",
        description: "Medical specialties",
      },
      {
        name: "patients",
        file: "backend/routes/patients.py",
        blueprint: "patients_bp",
        description: "Patient CRUD and search",
      },
      {
        name: "patient_contacts",
        file: "backend/routes/patient_contacts.py",
        blueprint: "patient_contacts_bp",
        description: "Emergency contacts for patients",
      },
      {
        name: "allergies",
        file: "backend/routes/allergies.py",
        blueprint: "allergies_bp",
        description: "Allergy catalog",
      },
      {
        name: "patient_allergies",
        file: "backend/routes/patient_allergies.py",
        blueprint: "patient_allergies_bp",
        description: "Patient-specific allergies",
      },
      {
        name: "medications",
        file: "backend/routes/medications.py",
        blueprint: "medications_bp",
        description: "Medication catalog",
      },
      {
        name: "patient_medications",
        file: "backend/routes/patient_medications.py",
        blueprint: "patient_medications_bp",
        description: "Patient prescriptions",
      },
      {
        name: "conditions",
        file: "backend/routes/conditions.py",
        blueprint: "conditions_bp",
        description: "Medical conditions catalog",
      },
      {
        name: "patient_conditions",
        file: "backend/routes/patient_conditions.py",
        blueprint: "patient_conditions_bp",
        description: "Patient diagnoses",
      },
      {
        name: "webhooks",
        file: "backend/routes/webhooks.py",
        blueprint: "webhooks_bp",
        description: "LemonSqueezy webhook handlers",
      },
    ];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(routes, null, 2),
        },
      ],
    };
  }

  private async getRouteDetails(args: { routeName: string }) {
    const routePath = path.join(
      PROJECT_ROOT,
      "backend",
      "routes",
      `${args.routeName}.py`
    );

    if (!fs.existsSync(routePath)) {
      throw new Error(`Route '${args.routeName}' not found`);
    }

    const content = fs.readFileSync(routePath, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Route: ${args.routeName}\nFile: ${routePath}\n\n${content}`,
        },
      ],
    };
  }

  private async getDatabaseSchema() {
    const schema = {
      database: "doctorcrm2.0",
      type: "PostgreSQL 14.19",
      tables: [
        {
          name: "organizations",
          description: "Multi-tenant organizations",
          key_fields: ["id", "slug", "name", "color_palette"],
        },
        {
          name: "users",
          description: "System users with authentication",
          key_fields: ["id", "email", "organization_id", "password_hash"],
        },
        {
          name: "subscriptions",
          description: "Subscription management",
          key_fields: ["id", "organization_id", "plan_name", "status"],
        },
        {
          name: "roles",
          description: "User roles (5 system + custom)",
          key_fields: ["id", "name", "is_system"],
        },
        {
          name: "permissions",
          description: "120 granular permissions",
          key_fields: ["id", "module_key", "category", "display_name"],
        },
        {
          name: "specialties",
          description: "39 medical specialties",
          key_fields: ["id", "name", "icon", "default_color"],
        },
        {
          name: "patients",
          description: "FHIR-compliant patient records",
          key_fields: ["id", "organization_id", "fhir_id", "mrn"],
        },
        {
          name: "patient_contacts",
          description: "Emergency contacts",
          key_fields: ["id", "patient_id", "relationship"],
        },
        {
          name: "allergies",
          description: "Allergy catalog",
          key_fields: ["id", "name", "category"],
        },
        {
          name: "patient_allergies",
          description: "Patient-specific allergies",
          key_fields: ["id", "patient_id", "allergy_id", "severity"],
        },
        {
          name: "medications",
          description: "Medication catalog",
          key_fields: ["id", "name", "generic_name"],
        },
        {
          name: "patient_medications",
          description: "Active prescriptions",
          key_fields: ["id", "patient_id", "medication_id", "status"],
        },
        {
          name: "conditions",
          description: "Medical conditions (ICD-10)",
          key_fields: ["id", "name", "icd10_code", "category"],
        },
        {
          name: "patient_conditions",
          description: "Patient diagnoses",
          key_fields: ["id", "patient_id", "condition_id", "status"],
        },
      ],
      relationships: [
        "User → Organization (many-to-one)",
        "User ↔ Role (many-to-many via user_roles)",
        "User ↔ Specialty (many-to-many via user_specialties)",
        "Role ↔ Permission (many-to-many via role_permissions)",
        "Patient → Organization (many-to-one)",
        "PatientContact → Patient (many-to-one)",
        "PatientAllergy → Patient, Allergy (many-to-one each)",
        "PatientMedication → Patient, Medication (many-to-one each)",
        "PatientCondition → Patient, Condition (many-to-one each)",
      ],
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  private async searchInProject(args: { query: string; fileType?: string }) {
    const results: string[] = [];
    const searchDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (["node_modules", "__pycache__", ".git", "build", ".next"].includes(entry.name)) {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          searchDir(fullPath);
        } else {
          const matchesName = entry.name.toLowerCase().includes(args.query.toLowerCase());
          const matchesType = !args.fileType || entry.name.endsWith(`.${args.fileType}`);
          
          if (matchesName && matchesType) {
            results.push(path.relative(PROJECT_ROOT, fullPath));
          }
        }
      }
    };

    searchDir(PROJECT_ROOT);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ query: args.query, results }, null, 2),
        },
      ],
    };
  }

  private async getAPIEndpoints() {
    const endpoints = {
      base_url: "http://localhost:5001/api",
      authentication: [
        "POST /auth/signup - Register new user",
        "POST /auth/login - Login and get JWT token",
        "GET /auth/me - Get current user info",
      ],
      organizations: [
        "GET /organizations - List all organizations",
        "POST /organizations - Create organization",
        "GET /organizations/:id - Get organization details",
        "PUT /organizations/:id - Update organization",
        "DELETE /organizations/:id - Delete organization",
      ],
      users: [
        "GET /users - List users in organization",
        "POST /users - Create user",
        "GET /users/:id - Get user details",
        "PUT /users/:id - Update user",
        "DELETE /users/:id - Delete user",
      ],
      patients: [
        "GET /patients - List patients with search/filter",
        "POST /patients - Create patient",
        "GET /patients/:id - Get patient details",
        "PUT /patients/:id - Update patient",
        "DELETE /patients/:id - Delete patient",
      ],
      clinical_data: [
        "GET /patient-allergies - List patient allergies",
        "POST /patient-allergies - Add patient allergy",
        "GET /patient-medications - List patient medications",
        "POST /patient-medications - Add patient medication",
        "GET /patient-conditions - List patient conditions",
        "POST /patient-conditions - Add patient condition",
      ],
      catalogs: [
        "GET /allergies - List allergy catalog",
        "GET /medications - List medication catalog",
        "GET /conditions - List conditions catalog",
        "GET /specialties - List medical specialties",
      ],
      rbac: [
        "GET /roles - List roles",
        "POST /roles - Create custom role",
        "GET /permissions - List all permissions",
        "POST /role-permissions - Assign permissions to role",
      ],
      subscriptions: [
        "GET /subscriptions - Get subscription info",
        "POST /subscriptions/create-checkout - Create checkout session",
        "POST /webhooks/lemonsqueezy - LemonSqueezy webhook",
      ],
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(endpoints, null, 2),
        },
      ],
    };
  }

  private async getTechStack() {
    const stack = {
      backend: {
        language: "Python 3.13.2",
        framework: "Flask 3.1.0",
        database: "PostgreSQL 14.19",
        orm: "SQLAlchemy (Flask-SQLAlchemy 3.1.1)",
        authentication: "JWT (Flask-JWT-Extended 4.6.0)",
        cors: "Flask-CORS 5.0.0",
        migrations: "Flask-Migrate 4.0.5",
        port: 5001,
        architecture: "Flask Blueprints (modular)",
      },
      frontend: {
        framework: "Next.js 16.0.1 (App Router)",
        react: "19.2.0",
        typescript: "^5",
        styling: "TailwindCSS ^4",
        icons: "Heroicons",
        port: 3000,
        authentication: "Context API + JWT",
        routing: "Multi-tenant with organization slugs",
      },
      standards: {
        medical: "FHIR R4",
        architecture: "Multi-tenant SaaS",
        security: "RBAC with 120 permissions",
      },
      integrations: {
        payments: "LemonSqueezy",
        subscriptions: "Basic, Professional, Enterprise plans",
      },
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(stack, null, 2),
        },
      ],
    };
  }

  private async getFHIRCompliance() {
    const fhirInfo = {
      standard: "FHIR R4",
      implementation: {
        patient_model: {
          file: "backend/models/patient.py",
          fhir_fields: [
            "fhir_id - Unique FHIR identifier",
            "mrn - Medical Record Number",
            "given_name, family_name - Name components",
            "birth_date - Date of birth",
            "gender - Administrative gender",
            "phone, email - Telecom",
            "address_line1, city, state, postal_code, country - Address",
            "marital_status - Marital status",
            "preferred_language - Language preference",
          ],
        },
        allergy_intolerance: {
          file: "backend/models/patient_allergy.py",
          fhir_fields: [
            "severity - criticality (low, moderate, high)",
            "reaction - clinical manifestation",
            "onset_date - when first identified",
            "status - active/inactive",
          ],
        },
        medication_statement: {
          file: "backend/models/patient_medication.py",
          fhir_fields: [
            "dosage - dosage instruction",
            "frequency - timing",
            "start_date, end_date - period",
            "status - active/completed/stopped",
            "prescribed_by - practitioner reference",
          ],
        },
        condition: {
          file: "backend/models/patient_condition.py",
          fhir_fields: [
            "icd10_code - code.coding",
            "onset_date - onset",
            "status - clinical status",
            "severity - severity",
            "notes - note",
          ],
        },
      },
      seed_data: {
        allergies: "backend/seed_allergies.py - FHIR AllergyIntolerance categories",
        medications: "backend/seed_medications.py - Common medications",
        conditions: "backend/seed_conditions.py - ICD-10 aligned conditions",
      },
      compliance_notes: [
        "All clinical models include FHIR-aligned fields",
        "UUIDs used for FHIR identifiers",
        "Proper coding systems (ICD-10 for conditions)",
        "Standardized status values",
        "Temporal tracking (onset, recorded dates)",
      ],
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(fhirInfo, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("DoctorCRM MCP Server running on stdio");
  }
}

const server = new DoctorCRMServer();
server.run().catch(console.error);
