import { useStore } from "@/store";
import CreateAccountModal from "@/features/accounts/components/CreateAccountModal";
import AddTransactionModal from "@/features/transactions/components/AddTransactionModal";
import TransferModal from "@/features/transfers/components/TransferModal";

const MODALS = {
  account: CreateAccountModal,
  transaction: AddTransactionModal,
  transfer: TransferModal,
};

/** Renders whichever modal is open in the store, so any screen can trigger it. */
const GlobalModals = () => {
  const modal = useStore((s) => s.modal);
  const closeModal = useStore((s) => s.closeModal);
  if (!modal) return null;
  const Component = MODALS[modal.name];
  return Component ? <Component open onClose={closeModal} {...modal.props} /> : null;
};

export default GlobalModals;
