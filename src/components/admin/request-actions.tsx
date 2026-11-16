"use client";

import { useState } from "react";
import { approveRequestAction, rejectRequestAction } from "@/app/actions/admin";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/auth/form-parts";

export type RequestSummary = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  branchName: string | null;
  orderNumber: string;
};

export function RequestActions({ request }: { request: RequestSummary }) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const close = () => setDialog(null);

  return (
    <div className="flex justify-end gap-1.5">
      <Button size="sm" variant="secondary" onClick={() => setDialog("approve")}>
        Одобрить
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDialog("reject")}>
        Отклонить
      </Button>

      <Dialog open={dialog === "approve"} onClose={close} title="Открыть доступ сотруднику?">
        <ApproveForm request={request} onDone={close} />
      </Dialog>
      <Dialog
        open={dialog === "reject"}
        onClose={close}
        title="Отклонить заявку"
        description={`${request.name} увидит причину при попытке входа.`}
      >
        <RejectForm id={request.id} onDone={close} />
      </Dialog>
    </div>
  );
}

function ApproveForm({ request, onDone }: { request: RequestSummary; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(approveRequestAction, onDone);
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={request.id} />
      <FormError message={state?.message} />
      <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-[13px]">
        <dt className="text-zinc-500">Сотрудник</dt>
        <dd className="font-medium">{request.name}</dd>
        <dt className="text-zinc-500">Email</dt>
        <dd className="break-all">{request.email}</dd>
        <dt className="text-zinc-500">Должность</dt>
        <dd>{request.roleLabel}</dd>
        {request.branchName && (
          <>
            <dt className="text-zinc-500">Отделение</dt>
            <dd>{request.branchName}</dd>
          </>
        )}
        <dt className="text-zinc-500">Приказ</dt>
        <dd>{request.orderNumber}</dd>
      </dl>
      <p className="mt-4 text-[13px] text-zinc-500">
        Проверьте номер приказа о приёме. После одобрения сотрудник сможет войти со своим паролем из заявки.
      </p>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Одобряем..." : "Одобрить"}
        </Button>
      </DialogActions>
    </form>
  );
}

function RejectForm({ id, onDone }: { id: string; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(rejectRequestAction, onDone);
  return (
    <form onSubmit={onSubmit} noValidate>
      <input type="hidden" name="id" value={id} />
      <FormError message={state?.message} />
      <div className="space-y-1.5">
        <Label htmlFor={`reason-${id}`}>Причина отказа</Label>
        <Textarea
          id={`reason-${id}`}
          name="reason"
          placeholder="Например: номер приказа не найден в отделе кадров"
          error={!!state?.errors?.reason}
          aria-describedby={state?.errors?.reason ? `reason-${id}-error` : undefined}
          maxLength={500}
          required
        />
        {state?.errors?.reason && (
          <p id={`reason-${id}-error`} className="text-[12px] text-red-600">
            {state.errors.reason}
          </p>
        )}
      </div>
      <DialogActions>
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Отклоняем..." : "Отклонить заявку"}
        </Button>
      </DialogActions>
    </form>
  );
}
