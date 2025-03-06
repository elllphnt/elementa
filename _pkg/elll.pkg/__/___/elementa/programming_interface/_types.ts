import { SchemaData } from "@repo/elementa";

export type QueryData = {
  id: string;
  name?: string;
  description?: string;
  args?: Array<{
    name: string;
    description: string;
    schema: SchemaData;
  }>;
  schema?: SchemaData;
};

export type CommandData = {
  id: string;
  name?: string;
  description?: string;
  args?: Array<{
    name: string;
    description: string;
    schema: SchemaData;
  }>;
  schema?: SchemaData;
};

export type DomainData = {
  id: string;
  name?: string;
  description?: string;
};

export type ProgrammingInterfaceData = {
  domains?: DomainData[];

  queries?: QueryData[];
  commands?: CommandData[];

  queriesByDomain?: Record<string, string[]>;
  commandsByDomain?: Record<string, string[]>;
};
