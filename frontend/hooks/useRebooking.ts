// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 37 & 38: Autonomous Rebooking Workflow Hook with Idempotency & Progress Steps
import { useState } from 'react';
import { RebookingRequest, RebookingStatus } from '../types';
import { rebookingService } from '../services/rebookingService';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { hotelService } from '../services/hotelService';

export type RebookingWorkflowStep =
  | 'IDLE'
  | 'VALIDATING'
  | 'CHECKING_AVAILABILITY'
  | 'GENERATING_IDEMPOTENCY'
  | 'EXECUTING_BOOKING'
  | 'VERIFYING'
  | 'SYNCHRONIZING_HOTEL'
  | 'EMITTING_AUDIT'
  | 'CONFIRMED'
  | 'APPROVAL_REQUIRED'
  | 'FAILED';

export function useRebooking() {
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<RebookingWorkflowStep>('IDLE');
  const [status, setStatus] = useState<RebookingStatus>('PENDING');
  const [activeRequest, setActiveRequest] = useState<RebookingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    disruptionId: string,
    alternativeId: string,
    opts?: { requiresApproval?: boolean; fare?: number; airline?: string; flightNumber?: string }
  ) => {
    setLoading(true);
    setError(null);

    // If candidate exceeds policy, escalate to approval
    if (opts?.requiresApproval) {
      setStep('APPROVAL_REQUIRED');
      setStatus('APPROVAL_REQUIRED');
      const req: RebookingRequest = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        disruptionId,
        alternativeId,
        idempotencyKey: `REBOOK-${disruptionId}-${alternativeId}-ESCALATED`,
        status: 'APPROVAL_REQUIRED',
        requiresApproval: true,
        approvalReason: `Additional fare of ₹${opts.fare?.toLocaleString('en-IN')} exceeds the ₹20,000 policy limit.`,
        createdAt: new Date().toISOString(),
      };
      setActiveRequest(req);
      setLoading(false);
      return req;
    }

    try {
      // Step 1: Validating constraints
      setStep('VALIDATING');
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Checking seat availability
      setStep('CHECKING_AVAILABILITY');
      await new Promise((r) => setTimeout(r, 450));

      // Step 3: Generating Idempotency Key (Section 38)
      setStep('GENERATING_IDEMPOTENCY');
      const idempotencyKey = `REBOOK-${disruptionId}-${alternativeId}-${Date.now()}`;
      await new Promise((r) => setTimeout(r, 400));

      // Step 4: Executing Rebooking API
      setStep('EXECUTING_BOOKING');
      const res = await rebookingService.executeRebooking({
        disruptionId,
        alternativeId,
        idempotencyKey,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'Booking API transaction failed');
      }

      // Step 5: Verifying Booking
      setStep('VERIFYING');
      await new Promise((r) => setTimeout(r, 450));

      // Step 6: Synchronizing Hotel (Section 39)
      setStep('SYNCHRONIZING_HOTEL');
      await hotelService.modifyHotel('HOTEL-LON-001', {
        checkIn: '2026-06-11',
        reason: 'Arrival delayed by replacement flight AI203',
      });
      await new Promise((r) => setTimeout(r, 400));

      // Step 7: Emitting Audit Event & Notification (Section 40 & 41)
      setStep('EMITTING_AUDIT');
      await auditService.recordAuditEvent({
        event: 'REBOOKING_CONFIRMED',
        actor: 'SYSTEM',
        action: 'AUTONOMOUS_REBOOK',
        decision: 'CONFIRMED',
        reason: `Rebooked to ${opts?.flightNumber || 'AI203'}. Hotel arrival synchronized.`,
        result: 'SUCCESS',
      });

      await notificationService.addNotification({
        title: 'Rebooking Successfully Confirmed',
        message: `Your booking for ${opts?.airline || 'Air India'} (${opts?.flightNumber || 'AI203'}) is confirmed. Hotel check-in updated.`,
        whatHappened: 'Flight AI101 cancelled. Connection rescheduled.',
        whatSystemDid: 'Autonomous rebooking completed with airline provider.',
        currentStatus: 'Confirmed & Validated.',
        whatUserMustDo: 'Proceed to Terminal 3 upon departure.',
      });

      setStep('CONFIRMED');
      setStatus('CONFIRMED');
      setActiveRequest(res.data);
      return res.data;
    } catch (err: any) {
      setStep('FAILED');
      setStatus('FAILED');
      setError(err.message || 'Rebooking workflow encountered an error');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (rebookingId: string) => {
    setLoading(true);
    try {
      const res = await rebookingService.approveRebooking(rebookingId);
      if (res.success && res.data) {
        setStatus('APPROVED');
        setStep('CONFIRMED');
        setActiveRequest(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const reject = async (rebookingId: string) => {
    setLoading(true);
    try {
      const res = await rebookingService.rejectRebooking(rebookingId);
      if (res.success && res.data) {
        setStatus('REJECTED');
        setStep('IDLE');
        setActiveRequest(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('IDLE');
    setStatus('PENDING');
    setError(null);
    setActiveRequest(null);
  };

  return {
    execute,
    approve,
    reject,
    reset,
    loading,
    step,
    status,
    activeRequest,
    error,
  };
}
