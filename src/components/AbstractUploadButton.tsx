import { CheckIcon, TriangleAlertIcon, UploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { userFriendlyError } from "./userFriendlyError";
import { useRef } from "react";
import { toast } from "sonner";

export function AbstractUploadButton({
  processFile,
  help,
  accept,
  title,
}: {
  processFile: (file: File) => Promise<void>;
  help: string;
  accept: string;
  title: string;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await processFile(file);
      toast("File uploaded successfully", {
        icon: <CheckIcon />,
        className: "!bg-green-500",
      });
    } catch (error) {
      const description = userFriendlyError(error);
      toast("Error uploading file", {
        icon: <TriangleAlertIcon />,
        closeButton: true,
        className: "!bg-destructive !text-destructive-foreground",
        duration: Infinity,
        description: (
          <>
            {description}
            <p className="mt-2">{help}</p>
          </>
        ),
      });
      console.error(error);
    } finally {
      // Reset the file input even when an error occurs
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  return (
    <Button
      variant="outline"
      onClick={() => uploadRef.current?.click()}
      title={title}
    >
      <UploadIcon />
      <span>Upload</span>
      <input
        ref={uploadRef}
        type="file"
        tabIndex={-1}
        accept={accept}
        onChange={uploadFile}
        style={{
          display: "none",
        }}
      />
    </Button>
  );
}
