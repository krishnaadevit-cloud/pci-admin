import { MDM_LOCATION_STATES } from "@/config/ApiConstant";
import { createAxios } from "../config/axiosInstance";
import { APP_BASE_URL_RBAC } from "@/appConfig/Settings";

export function createService(baseURL: string) {
  const api = createAxios(baseURL);

  return {
    getAllDetails: async (slug: string) => {
      try {
        const response = await api.get(slug);
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },

    // RBAC specific method to fetch all roles in the usermanagement module (for filtering purpose in dropdowns)
    getAllDetailsRabc: async (slug: string) => {
      try {
        const response = await api.get(slug);
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },

    deleteData: async (slug: string, id: any) => {
      try {
        const response = await api.delete(slug + "/" + id);
        return response;
      } catch (error) {
        throw error;
      }
    },

    deleteAllData: async (slug: string, id: any) => {
      return api.delete(slug + id);
    },

    postData: async (slug: string, body: any) => {
      try {
        const response = await api.post(slug, body);
        return response?.data;
      } catch (error) {
        throw error;
      }
    },

    patchData: async (slug: string, id: any, body: any) => {
      try {
        const response = await api.patch(slug + "/" + id, body);
        return response;
      } catch (error) {
        throw error;
      }
    },

    changeUserStatus: async (slug: string, id: any, isActive: boolean) => {
      try {
        const response = await api.post(
          `${slug}/${id}`,
          { isActive },
          // {
          //   headers: {
          //     "Content-Type": "application/json",
          //     "ngrok-skip-browser-warning": "any",
          //   },
          // },
        );

        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },
    changeRoleStatus: async (slug: string, id: any, isActive: boolean) => {
      try {
        const response = await api.post(
          `${slug}/${id}/status`,
          { isActive },
          // {
          //   headers: {
          //     "Content-Type": "application/json",
          //     "ngrok-skip-browser-warning": "any",
          //   },
          // },
        );

        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },
    getCitiesByState: async (stateId: number | string) => {
      try {
        const response = await api.get(
          `${MDM_LOCATION_STATES}/${stateId}/cities`,
        );
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },

    getById: async (slug: string, id: any) => {
      try {
        const response = await api.get(`${slug}/${id}`);
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },

    // getWithParams: async (slug: string, params: Record<string, any>) => {
    //   try {
    //     const query = new URLSearchParams();
    //     Object.entries(params).forEach(([key, value]) => {
    //       if (value !== undefined && value !== null && value !== "") {
    //         query.append(key, String(value));
    //       }
    //     });
    //     const response = await api.get(`${slug}?${query.toString()}`);
    //     return response?.data?.data;
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    getWithParams: async (slug: string, params: Record<string, any>) => {
      try {
        const response = await api.get(slug, { params });
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },
  };
}
