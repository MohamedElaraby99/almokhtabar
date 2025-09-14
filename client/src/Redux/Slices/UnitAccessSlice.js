import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Admin: Generate unit access codes
export const adminGenerateUnitAccessCodes = createAsyncThunk(
  "unitAccess/adminGenerateUnitAccessCodes",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/unit-access/admin/codes", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to generate codes" });
    }
  }
);

// Admin: List unit access codes
export const adminListUnitAccessCodes = createAsyncThunk(
  "unitAccess/adminListUnitAccessCodes",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.unitId) queryParams.append('unitId', params.unitId);
      if (params.q) queryParams.append('q', params.q);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await axiosInstance.get(`/unit-access/admin/codes?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to list codes" });
    }
  }
);

// Admin: Delete single unit access code
export const adminDeleteUnitAccessCode = createAsyncThunk(
  "unitAccess/adminDeleteUnitAccessCode",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/unit-access/admin/codes/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete code" });
    }
  }
);

// Admin: Bulk delete unit access codes
export const adminBulkDeleteUnitAccessCodes = createAsyncThunk(
  "unitAccess/adminBulkDeleteUnitAccessCodes",
  async ({ ids, courseId, unitId, onlyUnused = true }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/unit-access/admin/codes", {
        data: { ids, courseId, unitId, onlyUnused }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to bulk delete codes" });
    }
  }
);

// User: Redeem unit access code
export const redeemUnitAccessCode = createAsyncThunk(
  "unitAccess/redeemUnitAccessCode",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/unit-access/redeem", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to redeem code" });
    }
  }
);

// User: Check unit access
export const checkUnitAccess = createAsyncThunk(
  "unitAccess/checkUnitAccess",
  async ({ courseId, unitId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/unit-access/check/${courseId}/${unitId}`);
      return { courseId, unitId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to check access" });
    }
  }
);

const initialState = {
  byUnitId: {}, // courseId-unitId -> { hasAccess, accessEndAt }
  loading: false,
  error: null,
  lastRedemption: null,
  admin: {
    generating: false,
    listing: false,
    codes: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
  }
};

const unitAccessSlice = createSlice({
  name: "unitAccess",
  initialState,
  reducers: {
    clearUnitAccessError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUnitAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUnitAccess.fulfilled, (state, action) => {
        state.loading = false;
        const { courseId, unitId, data } = action.payload;
        const key = `${courseId}-${unitId}`;
        state.byUnitId[key] = {
          hasAccess: !!data.hasAccess,
          accessEndAt: data.accessEndAt || null,
          source: data.source || null
        };
      })
      .addCase(checkUnitAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to check access";
      })
      .addCase(redeemUnitAccessCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemUnitAccessCode.fulfilled, (state, action) => {
        state.loading = false;
        const { access } = action.payload.data;
        state.lastRedemption = access;
        const key = `${access.courseId}-${access.unitId}`;
        state.byUnitId[key] = {
          hasAccess: true,
          accessEndAt: access.accessEndAt
        };
      })
      .addCase(redeemUnitAccessCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to redeem code";
      })
      // Admin generate
      .addCase(adminGenerateUnitAccessCodes.pending, (state) => {
        state.admin.generating = true;
        state.error = null;
      })
      .addCase(adminGenerateUnitAccessCodes.fulfilled, (state, action) => {
        state.admin.generating = false;
        // Optionally add generated codes to the list
      })
      .addCase(adminGenerateUnitAccessCodes.rejected, (state, action) => {
        state.admin.generating = false;
        state.error = action.payload?.message || "Failed to generate codes";
      })
      // Admin list
      .addCase(adminListUnitAccessCodes.pending, (state) => {
        state.admin.listing = true;
        state.error = null;
      })
      .addCase(adminListUnitAccessCodes.fulfilled, (state, action) => {
        state.admin.listing = false;
        state.admin.codes = action.payload.data.codes || [];
        state.admin.pagination = action.payload.data.pagination || state.admin.pagination;
      })
      .addCase(adminListUnitAccessCodes.rejected, (state, action) => {
        state.admin.listing = false;
        state.error = action.payload?.message || "Failed to list codes";
      })
      // Admin delete
      .addCase(adminDeleteUnitAccessCode.fulfilled, (state) => {
        // Code will be removed from list on next refresh
      })
      .addCase(adminDeleteUnitAccessCode.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete code";
      })
      // Admin bulk delete
      .addCase(adminBulkDeleteUnitAccessCodes.fulfilled, (state) => {
        // Codes will be removed from list on next refresh
      })
      .addCase(adminBulkDeleteUnitAccessCodes.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to bulk delete codes";
      });
  }
});

export const { clearUnitAccessError } = unitAccessSlice.actions;
export default unitAccessSlice.reducer;
