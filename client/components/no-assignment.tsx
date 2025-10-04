import { File, Plus, PlusCircle, RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";

export function NoAssignment() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <File />
        </EmptyMedia>
        <EmptyTitle>No assignments done yet</EmptyTitle>
        <EmptyDescription>
          Get to creating your first assignment!
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={"/create"}>
          <Button size="lg">
            <PlusCircle />
            Create
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
