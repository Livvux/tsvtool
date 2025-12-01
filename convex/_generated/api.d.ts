/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as animals from "../animals.js";
import type * as apiStatus from "../apiStatus.js";
import type * as auditLog from "../auditLog.js";
import type * as distribution from "../distribution.js";
import type * as distributionHelpers from "../distributionHelpers.js";
import type * as http from "../http.js";
import type * as matchpfote from "../matchpfote.js";
import type * as r2 from "../r2.js";
import type * as rateLimit from "../rateLimit.js";
import type * as storage from "../storage.js";
import type * as translation from "../translation.js";
import type * as users from "../users.js";
import type * as validation from "../validation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  animals: typeof animals;
  apiStatus: typeof apiStatus;
  auditLog: typeof auditLog;
  distribution: typeof distribution;
  distributionHelpers: typeof distributionHelpers;
  http: typeof http;
  matchpfote: typeof matchpfote;
  r2: typeof r2;
  rateLimit: typeof rateLimit;
  storage: typeof storage;
  translation: typeof translation;
  users: typeof users;
  validation: typeof validation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
