import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { ApiItem, ApiList } from "@/types/api.types";
import type { Entity, EntityInput } from "@/types/entity.types";

/**
 * Error dari service membawa error axios asli di `cause`, supaya pemanggil masih bisa membaca
 * pesan per field (getApiFieldErrors) atau kode error (getApiErrorCode).
 */
function fail(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback), { cause: error });
}

export const entityService = {
  async list(): Promise<Entity[]> {
    try {
      const { data } = await httpClient.get<ApiList<Entity>>("/entities");
      return data.data;
    } catch (error) {
      fail(error, "Gagal memuat entitas");
    }
  },

  async get(id: string): Promise<Entity> {
    try {
      const { data } = await httpClient.get<ApiItem<Entity>>(`/entities/${id}`);
      return data.data;
    } catch (error) {
      fail(error, "Gagal memuat detail entitas");
    }
  },

  async create(input: EntityInput): Promise<Entity> {
    try {
      const { data } = await httpClient.post<ApiItem<Entity>>("/entities", input);
      return data.data;
    } catch (error) {
      fail(error, "Gagal menyimpan entitas");
    }
  },

  async update(id: string, input: EntityInput): Promise<Entity> {
    try {
      const { data } = await httpClient.put<ApiItem<Entity>>(`/entities/${id}`, input);
      return data.data;
    } catch (error) {
      fail(error, "Gagal menyimpan perubahan");
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(`/entities/${id}`);
    } catch (error) {
      fail(error, "Gagal menghapus entitas");
    }
  },
};
