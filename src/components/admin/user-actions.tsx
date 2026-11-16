"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { resetPasswordAction, setUserActiveAction, updateUserAction } from "@/app/actions/admin";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FormError } from "@/components/auth/form-parts";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "BRANCH_MANAGER" | "HQ_MANAGER";
  branchId: string | null;
  isActive: boolean;
};

type DialogKind = "edit" | "status" | "password";

export function UserActions({ user, branches }: { user: ManagedUser; branches: { id: string; name: string }[] }) {
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const close = () => setDialog(null);

  return (
    <div className="flex justify-end gap-1">
      {user.isActive && (
        <>
          <Button size="sm" variant="ghost" onClick={() => setDialog("edit")}>
            Изменить
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDialog("password")}>
            Сбросить пароль
          </Button>
        </>
      )}
      <Button size="sm" variant="ghost" onClick={() => setDialog("status")}>
        {user.isActive ? "Деактивировать" : "Активировать"}
      </Button>

      <Dialog open={dialog === "edit"} onClose={close} title="Изменить данные сотрудника" description={user.email}>
        <EditUserForm user={user} branches={branches} onDone={close} />
      </Dialog>
      <Dialog
        open={dialog === "status"}
        onClose={close}
        title={user.isActive ? "Деактивировать сотрудника?" : "Вернуть доступ?"}
      >
        <StatusForm user={user} onDone={close} />
      </Dialog>
      <Dialog open={dialog === "password"} onClose={close} title="Сбросить пароль?">
        <ResetPasswordForm user={user} onCancel={close} />
      </Dialog>
    </div>
  );
}

function EditUserForm({
  user,
  branches,
  onDone,
}: {
  user: ManagedUser;
  branches: { id: string; name: string }[];
  onDone: () => void;
}) {
  const { state, onSubmit, pending } = useFormAction(updateUserAction, onDone);
  const [role, setRole] = useState(user.role);
  const e = state?.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={user.id} />
      <FormError message={state?.message} />
      <Field label="ФИО" htmlFor={`name-${user.id}`} error={e?.name}>
        <Input id={`name-${user.id}`} name="name" defaultValue={user.name} error={!!e?.name} required />
      </Field>
      <Field label="Телефон" htmlFor={`phone-${user.id}`} error={e?.phone}>
        <Input id={`phone-${user.id}`} name="phone" type="tel" defaultValue={user.phone ?? ""} error={!!e?.phone} />
      </Field>
      <Field label="Должность" htmlFor={`role-${user.id}`} error={e?.role}>
        <Select
          id={`role-${user.id}`}
          name="role"
          value={role}
          onChange={(ev) => setRole(ev.target.value as ManagedUser["role"])}
        >
          <option value="BRANCH_MANAGER">Менеджер отделения</option>
          <option value="HQ_MANAGER">Менеджер головного офиса</option>
        </Select>
      </Field>
      {role === "BRANCH_MANAGER" && (
        <Field label="Отделение" htmlFor={`branch-${user.id}`} error={e?.branchId}>
          <Select id={`branch-${user.id}`} name="branchId" defaultValue={user.branchId ?? ""} error={!!e?.branchId}>
            <option value="">Выберите отделение</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </DialogActions>
    </form>
  );
}

function StatusForm({ user, onDone }: { user: ManagedUser; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(setUserActiveAction, onDone);
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="active" value={user.isActive ? "false" : "true"} />
      <FormError message={state?.message} />
      <p className="text-[14px] text-zinc-700">
        {user.isActive ? (
          <>
            <span className="font-medium text-zinc-900">{user.name}</span> сразу потеряет доступ: текущие входы
            закроются. Диспуты, комментарии и история сотрудника сохранятся.
          </>
        ) : (
          <>
            <span className="font-medium text-zinc-900">{user.name}</span> снова сможет войти со своим паролем.
          </>
        )}
      </p>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" variant={user.isActive ? "destructive" : "primary"} disabled={pending}>
          {user.isActive ? "Деактивировать" : "Активировать"}
        </Button>
      </DialogActions>
    </form>
  );
}

function ResetPasswordForm({ user, onCancel }: { user: ManagedUser; onCancel: () => void }) {
  const { state, onSubmit, pending } = useFormAction(resetPasswordAction);
  const [copied, setCopied] = useState(false);
  const password = state?.ok ? state.data?.temporaryPassword : undefined;

  if (password) {
    return (
      <div>
        <p className="text-[14px] text-zinc-700">
          Временный пароль для <span className="font-medium text-zinc-900">{user.name}</span>. Передайте его
          сотруднику лично — при входе система попросит сменить пароль.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
          <code className="flex-1 font-mono text-[16px] tracking-wide text-zinc-900" data-testid="temp-password">
            {password}
          </code>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(password);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
            {copied ? "Скопировано" : "Копировать"}
          </Button>
        </div>
        <p className="mt-3 text-[12px] text-zinc-500">Пароль показывается один раз и нигде не сохраняется в открытом виде.</p>
        <DialogActions>
          <Button type="button" onClick={onCancel}>
            Готово
          </Button>
        </DialogActions>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={user.id} />
      <FormError message={state?.message} />
      <p className="text-[14px] text-zinc-700">
        Текущий пароль <span className="font-medium text-zinc-900">{user.name}</span> перестанет работать, все входы
        закроются. Вы получите временный пароль, который сотрудник сменит при первом входе.
      </p>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Сбрасываем..." : "Сбросить пароль"}
        </Button>
      </DialogActions>
    </form>
  );
}
