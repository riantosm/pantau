import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { ApiItem, ApiList } from "@/types/api.types";
import type { EntityType, EntityTypeInput } from "@/types/entity-type.types";

function fail(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback), { cause: error });
}

export const entityTypeService = {
  async list(): Promise<EntityType[]> {
    try {
      const { data } = await httpClient.get<ApiList<EntityType>>("/entity-types");
      return data.data;
    } catch (error) {
      fail(error, "Gagal memuat jenis entitas");
    }
  },

  async create(input: EntityTypeInput): Promise<EntityType> {
    try {
      const { data } = await httpClient.post<ApiItem<EntityType>>("/entity-types", input);
      return data.data;
    } catch (error) {
      fail(error, "Gagal menyimpan jenis");
    }
  },

  async update(id: string, input: EntityTypeInput): Promise<EntityType> {
    try {
      const { data } = await httpClient.put<ApiItem<EntityType>>(`/entity-types/${id}`, input);
      return data.data;
    } catch (error) {
      fail(error, "Gagal menyimpan jenis");
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(`/entity-types/${id}`);
    } catch (error) {
      fail(error, "Gagal menghapus jenis");
    }
  },
};
