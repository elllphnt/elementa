import { parseEntityId } from "@elllphnt/utils";
import { ClientFactory } from "./client";
import { Resource, ResourceFactory } from "./resource";
import { Service, ServiceFactory } from "./service";
import { Store } from "./store";
import { isElllResourceUrl, parseElllResourceUrl } from "./url";

export abstract class Backend {
  private _properties: Map<string, any> = new Map();
  private _stores: Map<string, Store> = new Map();
  private _services: Map<ServiceFactory, Service> = new Map();
  private _clients: Map<ClientFactory, any> = new Map();

  store<R extends Resource>(
    factoryOrEntity: ResourceFactory<R> | string,
  ): Store<R> {
    const entity =
      typeof factoryOrEntity === "string"
        ? factoryOrEntity
        : factoryOrEntity.entity;
    const store = this._stores.get(entity);
    if (!store) {
      throw new Error(`Store not found for ${entity} resource factory`);
    }
    return store as any;
  }
  resourceStore<T extends Resource>(
    resourceType: string,
  ): Store<T> | undefined {
    return this._stores.get(resourceType) as any;
  }
  service<S extends Service>(factory: ServiceFactory<S>): S {
    const service = this._services.get(factory);
    if (!service) {
      throw new Error(
        `Service not found for ${factory.name ?? "anonymous"} service factory`,
      );
    }
    return service as any;
  }
  client<C>(factory: ClientFactory<C>): C {
    const client = this._clients.get(factory);
    if (!client) {
      throw new Error(
        `Client not found for ${factory.name ?? "anonymous"} client factory`,
      );
    }
    return client as any;
  }

  instance<T extends Resource>(id: string): T | undefined;
  instance<T extends Resource>(id: string, create: true): T;
  instance<T extends Resource>(
    idOrUrl: string,
    create?: true | undefined,
  ): typeof create extends true ? T : T | undefined {
    let id: string;

    if (isElllResourceUrl(idOrUrl)) {
      id = parseElllResourceUrl(idOrUrl).id;
    } else {
      id = idOrUrl;
    }

    const struct = parseEntityId(id);
    if (!struct) {
      throw new Error(`Invalid entity id: ${id}`);
    }

    const store = this.resourceStore(struct.entity_name);
    if (!store) {
      throw new Error(
        `Resource store not found for type ${struct.entity_name}`,
      );
    }

    return store.instance(id, create) as any;
  }

  addStore<R extends Resource>(factory: ResourceFactory<R>) {
    this._stores.set(factory.entity, new Store({ backend: this, factory }));
  }
  addService<S extends Service>(factory: ServiceFactory<S>) {
    this._services.set(factory, factory.createInstance({ backend: this }));
  }
  addClient<C>(factory: ClientFactory<C>) {
    this._clients.set(factory, factory.createInstance({ backend: this }));
  }

  getProperty(key: string) {
    return this._properties.get(key);
  }
  setProperty(key: string, value: any) {
    this._properties.set(key, value);
  }

  removeInstance(id: string) {
    const struct = parseEntityId(id);
    if (!struct) {
      throw new Error(`Invalid entity id: ${id}`);
    }

    const store = this.resourceStore(struct.entity_name);
    if (!store) {
      throw new Error(
        `Resource store not found for type ${struct.entity_name}`,
      );
    }

    store.remove(id);
  }
}
