"use client";

import { useState, useEffect, useCallback } from "react";

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [
  T,
  (value: T | ((val: T) => T)) => void,
  () => void
] {

  const serializer =
    options.serializer ?? JSON.stringify;

  const deserializer =
    options.deserializer ?? JSON.parse;


  const [storedValue, setStoredValue] =
    useState<T>(initialValue);


  // Load initial value
  useEffect(() => {

    if (typeof window === "undefined") return;

    try {

      const item =
        window.localStorage.getItem(key);

      if (item !== null) {
        setStoredValue(deserializer(item));
      }

    } catch (error) {

      console.warn(
        `Error reading localStorage key "${key}":`,
        error
      );

    }

  }, [key, deserializer]);


  // Update storage
  const setValue = useCallback(
    (
      value: T | ((val: T) => T)
    ) => {

      try {

        setStoredValue(previous => {

          const valueToStore =
            value instanceof Function
              ? value(previous)
              : value;


          if (typeof window !== "undefined") {

            window.localStorage.setItem(
              key,
              serializer(valueToStore)
            );

          }


          return valueToStore;

        });


      } catch(error){

        console.warn(
          `Error setting localStorage key "${key}":`,
          error
        );

      }

    },
    [
      key,
      serializer
    ]
  );


  // Remove storage
  const removeValue = useCallback(
    () => {

      try {

        setStoredValue(initialValue);

        if(typeof window !== "undefined"){

          window.localStorage.removeItem(key);

        }

      } catch(error){

        console.warn(
          `Error removing localStorage key "${key}":`,
          error
        );

      }

    },
    [
      key,
      initialValue
    ]
  );


  // Sync between browser tabs
  useEffect(() => {

    if(typeof window === "undefined")
      return;


    const handleStorageChange =
      (event: StorageEvent) => {

        if(event.key !== key)
          return;


        if(event.newValue === null){

          setStoredValue(initialValue);

        }
        else {

          try {

            setStoredValue(
              deserializer(event.newValue)
            );

          } catch(error){

            console.warn(
              "Storage sync error:",
              error
            );

          }

        }

      };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

    };


  }, [
    key,
    deserializer,
    initialValue
  ]);


  return [
    storedValue,
    setValue,
    removeValue
  ];
}