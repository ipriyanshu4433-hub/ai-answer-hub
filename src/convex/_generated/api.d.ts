/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_gemini from "../lib/gemini.js";
import type * as lib_groq from "../lib/groq.js";
import type * as lib_openai from "../lib/openai.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_types from "../lib/types.js";
import type * as search from "../search.js";
import type * as searchData from "../searchData.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  http: typeof http;
  "lib/gemini": typeof lib_gemini;
  "lib/groq": typeof lib_groq;
  "lib/openai": typeof lib_openai;
  "lib/openrouter": typeof lib_openrouter;
  "lib/types": typeof lib_types;
  search: typeof search;
  searchData: typeof searchData;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
