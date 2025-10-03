/**
 * Filters out empty values (null, undefined, empty strings) from form data
 * @param data The form data object to filter
 * @returns A new object with only non-empty values
 */
export function filterFormData<T extends Record<string, any>>(data: T): Partial<T> {
  const filtered: Partial<T> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      // Handle nested objects (but not Date objects)
      if (typeof value === 'object' && value !== null && !isDate(value) && !isFile(value)) {
        // Special handling for coverPage
        if (key === 'coverPage') {
          // Always include coverPage object but filter its properties
          const filteredCoverPage: any = {};
          for (const coverKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, coverKey)) {
              const coverValue = value[coverKey];
              if (coverValue !== null && coverValue !== undefined) {
                // For customCoverPdf, only include if it's a valid File
                if (coverKey === 'customCoverPdf') {
                  if (isFile(coverValue)) {
                    filteredCoverPage[coverKey] = coverValue;
                  }
                } else if (coverValue !== '') {
                  filteredCoverPage[coverKey] = coverValue;
                }
              }
            }
          }
          if (Object.keys(filteredCoverPage).length > 0) {
            filtered[key] = filteredCoverPage as T[typeof key];
          }
        } else {
          // For other objects, recursively filter
          const filteredNested = filterFormData(value);
          if (Object.keys(filteredNested).length > 0) {
            filtered[key] = filteredNested as T[typeof key];
          }
        }
      } 
      // Handle arrays
      else if (Array.isArray(value)) {
        if (value.length > 0) {
          // For groupMembers, filter out empty objects
          if (key === 'groupMembers') {
            const filteredArray = value.filter((item: any) => 
              item && typeof item === 'object' && 
              Object.values(item).some(val => val !== null && val !== undefined && val !== '')
            );
            if (filteredArray.length > 0) {
              filtered[key] = filteredArray as T[typeof key];
            }
          } else {
            filtered[key] = value as T[typeof key];
          }
        }
      } 
      // Handle primitive values
      else if (value !== null && value !== undefined && value !== '') {
        filtered[key] = value;
      }
    }
  }
  
  // Post-filter pass: if coverPage.type is custom, strip fields that should not be submitted
  try {
    const cover = (filtered as any).coverPage;
    if (cover && cover.type === 'custom') {
      // Remove auto-only metadata
      delete (filtered as any).universityName;
      delete (filtered as any).studentName;
      delete (filtered as any).teacherName;
      delete (filtered as any).submissionDate;
      delete (filtered as any).groupMembers;
    }
  } catch (_) {
    // No-op safeguard
  }

  return filtered;
}

/**
 * Type guard to check if a value is a Date
 */
function isDate(value: any): value is Date {
  return typeof value === 'object' && value !== null && 
         typeof (value as Date).getMonth === 'function' && 
         typeof (value as Date).getDate === 'function' && 
         typeof (value as Date).getFullYear === 'function';
}

/**
 * Type guard to check if a value is a File
 */
function isFile(value: any): value is File {
  return typeof value === 'object' && value !== null && 
         typeof (value as File).name === 'string' && 
         typeof (value as File).size === 'number' && 
         typeof (value as File).type === 'string';
}