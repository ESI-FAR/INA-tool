import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function DeDuplicatedComponentsView() {
    return (
    <Dialog modal={true}>
  <DialogTrigger asChild>
  <DropdownMenuItem>De-duplicated components</DropdownMenuItem>
    </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account and remove your data
        from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    );
}