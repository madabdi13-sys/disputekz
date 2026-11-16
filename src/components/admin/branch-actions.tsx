"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { saveBranchAction, setBranchActiveAction } from "@/app/actions/admin";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/auth/form-parts";

export type BranchRow = { id: string; name: string; code: string | null; isActive: boolean; activeUsers: number };

export function AddBranchButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} strokeWidth={1.5} />
        Добавить отделение
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Новое отделение">
        <BranchForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function BranchActions({ branch }: { branch: BranchRow }) {
  const [dialog, setDialog] = useState<"edit" | "status" | null>(null);
  const close = () => setDialog(null);

  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost" onClick={() => setDialog("edit")}>
        Изменить
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDialog("status")}>
        {branch.isActive ? "Закрыть" : "Открыть"}
      </Button>

      <Dialog open={dialog === "edit"} onClose={close} title="Изменить отделение">
        <BranchForm branch={branch} onDone={close} />
      </Dialog>
      <Dialog
        open={dialog === "status"}
        onClose={close}
        title={branch.isActive ? "Закрыть отделение?" : "Открыть отделение?"}
      >
        <BranchStatusForm branch={branch} onDone={close} />
      </Dialog>
    </div>
  );
}

function BranchForm({ branch, onDone }: { branch?: BranchRow; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(saveBranchAction, onDone);
  const e = state?.errors;
  const key = branch?.id ?? "new";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {branch && <input type="hidden" name="id" value={branch.id} />}
      <FormError message={state?.message} />
      <Field label="Название" htmlFor={`branch-name-${key}`} error={e?.name} hint="Как отделение видят сотрудники при регистрации">
        <Input
          id={`branch-name-${key}`}
          name="name"
          defaultValue={branch?.name}
          placeholder="Отделение №5, Алматы, ул. Абая 150"
          error={!!e?.name}
          required
        />
      </Field>
      <Field label="Код (необязательно)" htmlFor={`branch-code-${key}`} error={e?.code} hint="Внутренний код филиала, уникальный в банке">
        <Input
          id={`branch-code-${key}`}
          name="code"
          defaultValue={branch?.code ?? ""}
          placeholder="ALA-05"
          error={!!e?.code}
        />
      </Field>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : branch ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </form>
  );
}

function BranchStatusForm({ branch, onDone }: { branch: BranchRow; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(setBranchActiveAction, onDone);
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={branch.id} />
      <input type="hidden" name="active" value={branch.isActive ? "false" : "true"} />
      <FormError message={state?.message} />
      <p className="text-[14px] text-zinc-700">
        {branch.isActive ? (
          <>
            <span className="font-medium text-zinc-900">{branch.name}</span> пропадёт из списка при регистрации и
            назначении сотрудников. Диспуты отделения и история сохранятся.
            {branch.activeUsers > 0 && (
              <span className="mt-2 block text-amber-700">
                В отделении работают сотрудники ({branch.activeUsers}) — сначала переведите их или деактивируйте.
              </span>
            )}
          </>
        ) : (
          <>
            <span className="font-medium text-zinc-900">{branch.name}</span> снова появится в списках отделений.
          </>
        )}
      </p>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" variant={branch.isActive ? "destructive" : "primary"} disabled={pending}>
          {branch.isActive ? "Закрыть отделение" : "Открыть отделение"}
        </Button>
      </DialogActions>
    </form>
  );
}
