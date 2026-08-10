import JSZip from "jszip";

export function saveAsJson(filename: string, data: unknown) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function loadJsonFile<T>(
  file: File,
  validator?: (data: unknown) => boolean,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (validator && !validator(data)) {
          return reject(
            new Error("Estructura de archivo no válida para este colector."),
          );
        }

        resolve(data as T);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export async function saveAsZip(
  zipFilename: string,
  jsonData: unknown,
  files: { name: string; file: File }[] = [],
  jsonFilename = "sessionData.json",
) {
  const zip = new JSZip();
  zip.file(jsonFilename, JSON.stringify(jsonData, null, 2));

  for (const item of files) {
    const data = await item.file.arrayBuffer();
    zip.file(item.name, data);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", zipFilename);
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}
