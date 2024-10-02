import ocClient from "../../construct.ts";

try {
  const result = await ocClient.getDownloadUrl({
    fileId: "7294765e-1e77-4994-9b34-d87232a3cd58",
  });
  if (result.ok) {
    await result.json().then((data: any) => console.log(`Download URL:`, data));
  } else {
    console.error("Error fetching download url");
  }
} catch (error) {
  console.error("Error fetching context list:", error);
}
