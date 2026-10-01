import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export function useAutosave(
  methods: UseFormReturn<any>,
  saveFn: (data: any) => Promise<void>,
  delay: number = 2000
) {
  const { watch, formState: { isDirty } } = methods;
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const subscription = watch(() => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If form is valid and has been touched, schedule a save
      if (isDirty) {
        timeoutRef.current = setTimeout(async () => {
          try {
            // Only autosave if valid
            const isValid = await methods.trigger();
            if (isValid) {
               await saveFn(methods.getValues());
               methods.reset(undefined, { keepValues: true, keepDirty: false });
            }
          } catch (e) {
            console.error('Autosave failed:', e);
          }
        }, delay);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [watch, isDirty, saveFn, methods, delay]);
}
