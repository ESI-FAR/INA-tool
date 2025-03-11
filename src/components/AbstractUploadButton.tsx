import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { userFriendlyError } from "./userFriendlyError";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

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
  const { toast } = useToast();
  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await processFile(file);
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      const description = userFriendlyError(error);
      toast({
        title: "Error uploading file",
        variant: "destructive",
        description: (
          <>
            {description}
            <p className="mt-2">{help}</p>
          </>
        ),
      });
      console.error(error);
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
