"use client";

import { EMPTY_MY_INFO, type MyInfo } from "./engine/types";
import { loadMyInfo, saveMyInfo } from "./myInfo";
import { createPhoneStore } from "./phoneStore";

const { store, useValue } = createPhoneStore<MyInfo>(loadMyInfo, saveMyInfo, EMPTY_MY_INFO);

export const myInfoStore = store;
export const useMyInfo = useValue;
