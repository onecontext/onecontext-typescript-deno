import ocClient from "../../construct.ts";

try {
  const result = await ocClient.deleteFile(
    {
      fileId: "7294765e-1e77-4994-9b34-d87232a3cd58",
    },
  );
  if (result.ok) {
    await result.json().then((data: any) =>
      console.log("Deleting file:", data)
    );
  } else {
    console.error("Error deleting file");
  }
} catch (error) {
  console.error("Error deleting file:", error);
}
