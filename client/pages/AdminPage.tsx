import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Key,
  Users,
  Upload,
  Activity,
  RefreshCw,
  Eye,
  CreditCard,
} from "lucide-react";
import { PaymentMonitoring } from "@/components/admin/PaymentMonitoring";
import { PaymentAlerts } from "@/components/admin/PaymentAlerts";
import { PaymentConfirmation } from "@/components/admin/PaymentConfirmation";
import { getLeaderboard, getTraderCount } from "@/lib/api";
import {
  uploadCredential,
  getAllCredentials,
  getAssignments,
  assignCredentialToTrader,
  removeAssignment,
  deleteCredential,
  TradingCredential,
  CredentialAssignment,
} from "@/lib/credentials";
import {
  getPaymentSettings,
  updatePaymentSettings,
  deleteTrader,
  AdminPaymentSettings,
} from "@/lib/api";
import {
  linkForexFactoryAccount,
  getForexFactoryIntegrationsWithDetails,
  triggerForexFactorySyncIntegration,
  triggerForexFactorySyncAll,
  getRecentForexFactorySyncs,
  deleteForexFactoryIntegration,
  testForexFactoryConnection,
  ForexFactoryIntegration,
  SyncHistoryRecord,
} from "@/lib/forex-factory";
import {
  parseForexFactoryCSV,
  uploadForexFactoryTraderData,
  generateCSVTemplate,
  ForexFactoryTraderData,
} from "@/lib/forex-factory-manual";

interface Trader {
  rank: number;
  username: string;
  startingBalance: number;
  currentBalance: number;
  profitPercentage: number;
  id?: string;
  email?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "traders" | "credentials" | "assignments" | "monitoring" | "payments" | "passwords"
  >("traders");

  // Password management state
  const [passwordSearch, setPasswordSearch] = useState("");
  const [tradersWithPasswords, setTradersWithPasswords] = useState<any[]>([]);
  const [isLoadingPasswords, setIsLoadingPasswords] = useState(false);

  // Traders state
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoadingTraders, setIsLoadingTraders] = useState(true);

  // Credentials state
  const [credentials, setCredentials] = useState<TradingCredential[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentialForm, setCredentialForm] = useState({
    account_username: "",
    account_password: "",
    account_number: "",
    broker: "JustMarkets",
    notes: "",
    is_active: true,
  });

  // Assignments state
  const [assignments, setAssignments] = useState<CredentialAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<string>("");
  const [selectedCredential, setSelectedCredential] = useState<string>("");

  // Monitoring state
  const [forexFactoryIntegrations, setForexFactoryIntegrations] = useState<any[]>([]);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCredentialForLink, setSelectedCredentialForLink] = useState<string>("");
  const [forexFactoryForm, setForexFactoryForm] = useState({
    ff_account_username: "",
    ff_api_key: "",
    ff_system_id: "",
  });

  // Bulk upload state
  const [csvInput, setCSVInput] = useState("");
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Payment approval state
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoadingPendingPayments, setIsLoadingPendingPayments] = useState(false);
  const [approvingPaymentId, setApprovingPaymentId] = useState<string | null>(null);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings | null>(null);
  const [isLoadingPaymentSettings, setIsLoadingPaymentSettings] = useState(false);
  const [showPaymentSettingsForm, setShowPaymentSettingsForm] = useState(false);
  const [paymentSettingsForm, setPaymentSettingsForm] = useState({
    nigerian_bank_name: "",
    nigerian_account_name: "",
    nigerian_account_number: "",
    nigerian_swift_code: "",
    binance_pay_id: "",
    binance_network: "BNB",
    bybit_wallet_address: "",
    bybit_network: "BTC",
  });
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  // Load traders on mount
  useEffect(() => {
    const loadTraders = async () => {
      try {
        setIsLoadingTraders(true);
        console.log('[AdminPage] Loading traders...');
        const data = await getLeaderboard();
        console.log('[AdminPage] Loaded', data.length, 'traders');
        setTraders(data);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Error loading traders:", errorMsg);
        // Don't crash, just show empty traders
        setTraders([]);
      } finally {
        setIsLoadingTraders(false);
      }
    };

    loadTraders();
  }, []);

  // Load credentials when tab changes
  useEffect(() => {
    if (activeTab === "credentials") {
      loadCredentials();
    }
  }, [activeTab]);

  // Load assignments when tab changes
  useEffect(() => {
    if (activeTab === "assignments") {
      loadAssignments();
    }
  }, [activeTab]);

  // Load monitoring data when tab changes
  useEffect(() => {
    if (activeTab === "monitoring") {
      loadMonitoring();
    }
  }, [activeTab]);

  // Load pending payments when tab changes
  useEffect(() => {
    if (activeTab === "payments") {
      loadPendingPayments();
      loadPaymentSettings();
    }
  }, [activeTab]);

  // Load traders with passwords when tab changes
  useEffect(() => {
    if (activeTab === "passwords") {
      loadTradersWithPasswords();
    }
  }, [activeTab]);

  const loadTradersWithPasswords = async () => {
    setIsLoadingPasswords(true);
    try {
      const response = await fetch('/api/admin/traders-with-passwords');
      const data = await response.json();
      if (data.success) {
        setTradersWithPasswords(data.traders || []);
      }
    } catch (error) {
      console.error("Error loading traders with passwords:", error);
      setTradersWithPasswords([]);
    } finally {
      setIsLoadingPasswords(false);
    }
  };

  const filteredTradersWithPasswords = tradersWithPasswords.filter(trader => {
    const searchLower = passwordSearch.toLowerCase();
    return (
      trader.username?.toLowerCase().includes(searchLower) ||
      trader.email?.toLowerCase().includes(searchLower) ||
      trader.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const loadPendingPayments = async () => {
    setIsLoadingPendingPayments(true);
    try {
      const response = await fetch('/api/admin/payments/pending');
      const data = await response.json();
      if (data.success) {
        setPendingPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error loading pending payments:", error);
      setPendingPayments([]);
    } finally {
      setIsLoadingPendingPayments(false);
    }
  };

  const loadPaymentSettings = async () => {
    setIsLoadingPaymentSettings(true);
    try {
      const settings = await getPaymentSettings();
      if (settings) {
        setPaymentSettings(settings);
        setPaymentSettingsForm({
          nigerian_bank_name: settings.nigerian_bank_name || "",
          nigerian_account_name: settings.nigerian_account_name || "",
          nigerian_account_number: settings.nigerian_account_number || "",
          nigerian_swift_code: settings.nigerian_swift_code || "",
          binance_pay_id: settings.binance_pay_id || "",
          binance_network: settings.binance_network || "BNB",
          bybit_wallet_address: settings.bybit_wallet_address || "",
          bybit_network: settings.bybit_network || "BTC",
        });
      }
    } catch (error) {
      console.error("Error loading payment settings:", error);
    } finally {
      setIsLoadingPaymentSettings(false);
    }
  };

  const loadCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      console.log('[AdminPage] Loading credentials...');
      const data = await getAllCredentials();
      console.log('[AdminPage] Loaded', data.length, 'credentials');
      setCredentials(data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error loading credentials:", errorMsg, error);
      // Don't re-throw, just show empty credentials
      setCredentials([]);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      console.log('[AdminPage] Loading assignments...');
      const data = await getAssignments();
      console.log('[AdminPage] Loaded', data.length, 'assignments');
      setAssignments(data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error loading assignments:", errorMsg);
      setAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleUploadCredential = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !credentialForm.account_username ||
      !credentialForm.account_password ||
      !credentialForm.account_number
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await uploadCredential(credentialForm);

    if (result.credential) {
      setCredentialForm({
        account_username: "",
        account_password: "",
        account_number: "",
        broker: "JustMarkets",
        notes: "",
        is_active: true,
      });
      setShowCredentialForm(false);
      await loadCredentials();
      await loadAssignments();

      if (result.assignedTo) {
        alert(`✅ Credential uploaded and automatically assigned to ${result.assignedTo}!`);
      } else {
        alert("✅ Credential uploaded successfully! No traders available for auto-assignment.");
      }
    } else {
      const errorMsg = result.error || "Account number may already exist";
      alert(`❌ Error: Failed to upload credential.\n\n${errorMsg}`);
    }
  };

  const handleApprovePayment = async (traderId: string, fullName: string) => {
    if (!window.confirm(`Approve payment for ${fullName}? They will see their trading credentials on their dashboard.`)) {
      return;
    }

    setApprovingPaymentId(traderId);
    try {
      const response = await fetch(`/api/admin/payments/${traderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        const message = `✅ Payment approved for ${fullName}!\n\nThey can now access their credentials on their dashboard.\n\nDashboard link: ${window.location.origin}/dashboard`;
        alert(message);
        await loadPendingPayments();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error approving payment: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setApprovingPaymentId(null);
    }
  };

  const handleRejectPayment = async (traderId: string, fullName: string) => {
    const reason = window.prompt(`Reject payment for ${fullName}? (Reason will be noted)`);
    if (reason === null) {
      return; // User cancelled
    }

    try {
      const response = await fetch(`/api/admin/payments/${traderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Payment rejected for ${fullName}`);
        await loadPendingPayments();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error rejecting payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentSettingsForm.nigerian_account_number || !paymentSettingsForm.binance_pay_id || !paymentSettingsForm.bybit_wallet_address) {
      alert("Please fill in all required payment account details");
      return;
    }

    setIsSavingPaymentSettings(true);
    try {
      const result = await updatePaymentSettings(paymentSettingsForm);

      if (result.success) {
        setPaymentSettings(result.settings || null);
        setShowPaymentSettingsForm(false);
        alert("✅ Payment settings updated successfully!");
      } else {
        alert(`❌ Error: ${result.message || "Failed to update payment settings"}`);
      }
    } catch (error) {
      alert(`❌ Error saving payment settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleDeleteTrader = async (trader: Trader) => {
    if (!window.confirm(`Are you sure you want to delete ${trader.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (!trader.id) {
        alert("❌ Error: Trader ID not found");
        return;
      }

      const result = await deleteTrader(trader.id);

      if (result.success) {
        alert(`✅ Trader ${trader.username} has been deleted`);
        // Reload traders list
        const data = await getLeaderboard();
        setTraders(data);
      } else {
        alert(`❌ Error: ${result.message || "Failed to delete trader"}`);
      }
    } catch (error) {
      alert(`❌ Error deleting trader: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const loadMonitoring = async () => {
    setIsLoadingMonitoring(true);
    try {
      console.log('[AdminPage] Loading monitoring data...');
      const integrations = await getForexFactoryIntegrationsWithDetails();
      console.log('[AdminPage] Loaded', integrations.length, 'Forex Factory integrations');
      setForexFactoryIntegrations(integrations);

      // Load sync history from the first integration if available
      if (integrations.length > 0) {
        const recentSyncs = await getRecentForexFactorySyncs(integrations[0].id, 10);
        setSyncHistory(recentSyncs);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error loading monitoring data:", errorMsg);
      // Don't crash, just show empty data
      setForexFactoryIntegrations([]);
      setSyncHistory([]);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  const handleLinkForexFactory = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Admin] Forex Factory Form Data:', {
      selectedCredentialForLink,
      ff_account_username: forexFactoryForm.ff_account_username,
      ff_api_key: forexFactoryForm.ff_api_key ? '***' : 'empty',
      ff_system_id: forexFactoryForm.ff_system_id,
    });

    if (!selectedCredentialForLink || !forexFactoryForm.ff_account_username || !forexFactoryForm.ff_api_key || !forexFactoryForm.ff_system_id) {
      alert("Please fill in all required fields");
      return;
    }

    // Test connection first
    const testResult = await testForexFactoryConnection(
      forexFactoryForm.ff_account_username,
      forexFactoryForm.ff_api_key,
      forexFactoryForm.ff_system_id
    );

    if (!testResult.success) {
      alert(`❌ Connection test failed: ${testResult.message}`);
      return;
    }

    const result = await linkForexFactoryAccount(
      selectedCredentialForLink,
      forexFactoryForm.ff_account_username,
      forexFactoryForm.ff_api_key,
      forexFactoryForm.ff_system_id
    );

    if (result.success) {
      setForexFactoryForm({
        ff_account_username: "",
        ff_api_key: "",
        ff_system_id: "",
      });
      setSelectedCredentialForLink("");
      setShowLinkForm(false);
      await loadMonitoring();
      alert("✅ Forex Factory account linked successfully!");
    } else {
      alert(`Failed to link Forex Factory account: ${result.error}`);
    }
  };

  const handleManualSync = async (integrationId: string) => {
    setIsSyncing(true);
    try {
      const result = await triggerForexFactorySyncIntegration(integrationId);
      if (result.success) {
        await loadMonitoring();
        alert("✅ Sync triggered! Data will be updated shortly.");
      } else {
        const errorMsg = result.error || 'Unknown error - check server logs';
        alert(`❌ Sync failed:\n\n${errorMsg}\n\n📋 TROUBLESHOOTING TIPS:\n\n1. MetaApi Users:\n   - Server Endpoint should be: https://api.metaapi.cloud/v1/accounts\n   - NOT the configuration page URL\n   - MT5 Account ID should be your MetaApi account ID\n\n2. Broker API Users:\n   - Verify the API endpoint URL is correct\n   - Check if Account ID is a number (not UUID)\n   - Confirm API Token/Password hasn't expired\n\n3. General:\n   - Test the endpoint URL in your browser\n   - Check that the Account ID exists and is active\n   - Verify the API credentials have proper permissions`);
      }
    } catch (error) {
      console.error("Error triggering sync:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Error triggering sync:\n\n${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!confirm("Sync data for all Forex Factory integrations?")) return;

    setIsSyncing(true);
    try {
      const result = await triggerForexFactorySyncAll();
      if (result.success) {
        await loadMonitoring();
        alert(`✅ Sync triggered for ${result.synced} integration(s)!`);
      } else {
        const errorMsg = result.error || 'Unknown error';
        alert(`❌ Sync failed:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error("Error syncing all:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Error syncing:\n\n${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvInput.trim()) {
      alert("Please paste CSV data first");
      return;
    }

    setIsUploadingBulk(true);
    setUploadErrors([]);
    setUploadSuccess(false);

    try {
      console.log('[AdminPage] Parsing CSV data...');
      const traders = parseForexFactoryCSV(csvInput);

      if (traders.length === 0) {
        alert("❌ No valid trader data found in CSV. Please check the format.");
        setIsUploadingBulk(false);
        return;
      }

      console.log(`[AdminPage] Uploading ${traders.length} traders...`);

      // Use first credential as default, or let user select
      const credId = credentials.length > 0 ? credentials[0].id : '';
      if (!credId) {
        alert("❌ No credentials available. Please create a credential first.");
        setIsUploadingBulk(false);
        return;
      }

      const result = await uploadForexFactoryTraderData(traders, credId);

      console.log('[AdminPage] Upload result:', result);

      if (result.updatedCount > 0) {
        setUploadSuccess(true);
        setCSVInput("");
        await loadMonitoring();
        alert(`✅ Successfully updated ${result.updatedCount} trader(s)!`);
      }

      if (result.errors.length > 0) {
        setUploadErrors(result.errors);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error uploading bulk data:", errorMsg);
      setUploadErrors([errorMsg]);
      alert(`❌ Error uploading traders:\n\n${errorMsg}`);
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm("Delete this Forex Factory integration?")) return;

    const result = await deleteForexFactoryIntegration(integrationId);
    if (result.success) {
      await loadMonitoring();
      alert("Integration deleted");
    } else {
      alert(`Failed to delete integration: ${result.error}`);
    }
  };

  const handleAssignCredential = async () => {
    if (!selectedTrader || !selectedCredential) {
      alert("Please select both a trader and a credential");
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(selectedTrader)) {
      alert(`❌ Error: Invalid trader ID format. Selected ID: "${selectedTrader}". Please refresh and try again.`);
      return;
    }

    const result = await assignCredentialToTrader(
      selectedTrader,
      selectedCredential
    );

    if (result.success) {
      setSelectedTrader("");
      setSelectedCredential("");
      await loadAssignments();
      alert("✅ Credential assigned successfully!");
    } else {
      alert(`❌ Error: ${result.error || "Failed to assign credential"}`);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    const result = await removeAssignment(assignmentId);

    if (result.success) {
      await loadAssignments();
      alert("✅ Assignment removed");
    } else {
      alert(`❌ Error: ${result.error || "Failed to remove assignment"}`);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (
      !confirm("Are you sure? This will remove all assignments for this credential.")
    ) {
      return;
    }

    const result = await deleteCredential(credentialId);

    if (result.success) {
      await loadCredentials();
      alert("✅ Credential deleted");
    } else {
      alert(`❌ Error: ${result.error || "Failed to delete credential"}`);
    }
  };

  // Get available credentials (not yet assigned)
  const availableCredentials = credentials.filter(
    (cred) => !assignments.some((a) => a.credential_id === cred.id)
  );

  // Get traders without assigned credentials (and with valid IDs)
  const tradersWithoutCredentials = traders.filter(
    (trader) =>
      trader.id && // Must have a valid ID (UUID format)
      !assignments.some((a) => a.trader_id === trader.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-3 py-6 md:px-4 md:py-12 sm:px-3">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage traders, upload credentials, and assign accounts
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab("traders")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "traders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Traders"
            >
              <Users className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Traders</span>
              <span className="sm:hidden">({traders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "credentials"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Credentials"
            >
              <Key className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Credentials</span>
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "assignments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Assignments"
            >
              <Upload className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Assignments</span>
            </button>
            <button
              onClick={() => setActiveTab("monitoring")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "monitoring"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Monitoring"
            >
              <Activity className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "payments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Payments"
            >
              <CreditCard className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Payments</span>
            </button>
            <button
              onClick={() => setActiveTab("passwords")}
              className={`px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "passwords"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Passwords"
            >
              🔐
              <span className="hidden sm:inline ml-1">Passwords</span>
            </button>
          </div>

          {/* Traders Tab */}
          {activeTab === "traders" && (
            <div className="space-y-6">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {isLoadingTraders ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading traders...</p>
                  </div>
                ) : traders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No traders registered yet</p>
                  </div>
                ) : (
                  traders.map((trader, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{trader.username}</p>
                          <p className="text-xs text-muted-foreground break-all">{trader.email || "N/A"}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTrader(trader)}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Start Balance</p>
                          <p className="font-medium text-foreground">${trader.startingBalance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Current Balance</p>
                          <p className="font-medium text-foreground">${trader.currentBalance.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Profit %</p>
                          <span
                            className={`font-semibold ${
                              trader.profitPercentage >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {trader.profitPercentage >= 0 ? "+" : ""}
                            {trader.profitPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                        Start Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                        Current Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                        Profit %
                      </th>
                      <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTraders ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <p className="text-muted-foreground text-sm">Loading traders...</p>
                        </td>
                      </tr>
                    ) : traders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <p className="text-muted-foreground text-sm">No traders registered yet</p>
                        </td>
                      </tr>
                    ) : (
                      traders.map((trader, index) => (
                        <tr
                          key={index}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground text-sm">
                            {trader.username}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs sm:text-sm">
                            {trader.email || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-xs sm:text-sm">
                            ${trader.startingBalance.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-foreground text-xs sm:text-sm">
                            ${trader.currentBalance.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs sm:text-sm">
                            <span
                              className={`font-semibold ${
                                trader.profitPercentage >= 0
                                  ? "text-success"
                                  : "text-destructive"
                              }`}
                            >
                              {trader.profitPercentage >= 0 ? "+" : ""}
                              {trader.profitPercentage.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteTrader(trader)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === "credentials" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Trading Account Credentials
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Upload credentials and they will be automatically assigned to unregistered traders
                  </p>
                </div>
                <button
                  onClick={() => setShowCredentialForm(!showCredentialForm)}
                  className="flex-shrink-0 flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Credential</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {/* Credential Form */}
              {showCredentialForm && (
                <div className="rounded-lg border border-border bg-card p-3 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Upload New Trading Credential
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    When uploaded, this credential will be automatically assigned to the first unassigned trader
                  </p>

                  <form onSubmit={handleUploadCredential} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Account Username *
                        </label>
                        <Input
                          type="text"
                          value={credentialForm.account_username}
                          onChange={(e) =>
                            setCredentialForm({
                              ...credentialForm,
                              account_username: e.target.value,
                            })
                          }
                          placeholder="e.g., trader_123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Account Password *
                        </label>
                        <Input
                          type="password"
                          value={credentialForm.account_password}
                          onChange={(e) =>
                            setCredentialForm({
                              ...credentialForm,
                              account_password: e.target.value,
                            })
                          }
                          placeholder="Account password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Account Number *
                        </label>
                        <Input
                          type="text"
                          value={credentialForm.account_number}
                          onChange={(e) =>
                            setCredentialForm({
                              ...credentialForm,
                              account_number: e.target.value,
                            })
                          }
                          placeholder="e.g., 12345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Broker
                        </label>
                        <Input
                          type="text"
                          value={credentialForm.broker}
                          onChange={(e) =>
                            setCredentialForm({
                              ...credentialForm,
                              broker: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Notes
                      </label>
                      <textarea
                        value={credentialForm.notes}
                        onChange={(e) =>
                          setCredentialForm({
                            ...credentialForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Additional notes (optional)"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowCredentialForm(false)}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Upload Credential
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {isLoadingCredentials ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Loading credentials...</p>
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No credentials uploaded yet</p>
                  </div>
                ) : (
                  credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="rounded-lg border border-border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Username</p>
                          <p className="font-medium text-foreground text-sm break-all">{cred.account_username}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="flex-shrink-0 p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Delete credential"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Account #</p>
                          <p className="text-sm text-foreground font-mono break-all">{cred.account_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Broker</p>
                          <p className="text-sm text-foreground">{cred.broker}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Status</p>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            cred.is_active
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {cred.is_active ? (
                            <>
                              <Check className="h-3 w-3" /> Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" /> Inactive
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Account #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Broker
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCredentials ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">Loading credentials...</p>
                        </td>
                      </tr>
                    ) : credentials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">No credentials uploaded yet</p>
                        </td>
                      </tr>
                    ) : (
                      credentials.map((cred) => (
                        <tr
                          key={cred.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground text-sm">
                            {cred.account_username}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm font-mono">
                            {cred.account_number}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            {cred.broker}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                cred.is_active
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {cred.is_active ? (
                                <>
                                  <Check className="h-3 w-3" /> Active
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3" /> Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteCredential(cred.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="space-y-6">
              {/* Info Box */}
              <div className="rounded-lg border border-success/50 bg-success/5 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">ℹ️ Auto-Assignment:</strong> When you upload a new credential, it's automatically assigned to the first unassigned trader. Use this section to reassign credentials between traders if needed.
                </p>
              </div>

              {/* Assignment Form */}
              <div className="rounded-lg border border-border bg-card p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                  Reassign Credential to Different Trader
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Select Trader
                    </label>
                    <select
                      value={selectedTrader}
                      onChange={(e) => setSelectedTrader(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Choose a trader...</option>
                      {tradersWithoutCredentials.map((trader) => (
                        <option key={trader.id} value={trader.id!}>
                          {trader.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Select Credential
                    </label>
                    <select
                      value={selectedCredential}
                      onChange={(e) => setSelectedCredential(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Choose a credential...</option>
                      {availableCredentials.map((cred) => (
                        <option key={cred.id} value={cred.id}>
                          {cred.account_username} ({cred.account_number})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAssignCredential}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {isLoadingAssignments ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No assignments yet</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Trader</p>
                          <p className="font-medium text-foreground text-sm break-words">
                            {assignment.trader?.full_name || "Unknown"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="flex-shrink-0 p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Remove assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2 border-t border-border pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="text-sm text-foreground break-all">{assignment.trader?.email || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Account Username</p>
                          <p className="text-sm text-foreground font-mono break-all">{assignment.credential?.account_username || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Account #</p>
                          <p className="text-sm text-foreground font-mono break-all">{assignment.credential?.account_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Assigned Date</p>
                          <p className="text-sm text-foreground">{new Date(assignment.assigned_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Trader
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Acc #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAssignments ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">Loading assignments...</p>
                        </td>
                      </tr>
                    ) : assignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">No assignments yet</p>
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground text-sm">
                            {assignment.trader?.full_name || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm break-all">
                            {assignment.trader?.email || "N/A"}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-foreground">
                            {assignment.credential?.account_username || "N/A"}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                            {assignment.credential?.account_number || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              {/* Info Box */}
              <div className="rounded-lg border border-primary/50 bg-primary/5 p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-2">📊 Forex Factory Manual Data Upload</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Upload your top Forex Factory traders daily. Copy the top 10 traders from Forex Factory Trade Explorer and paste the data below to update the leaderboard.
                </p>
                <details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary">
                    📖 How to upload Forex Factory trader data
                  </summary>
                  <div className="mt-3 space-y-2 ml-2 border-l-2 border-primary/30 pl-3">
                    <p><strong>Step 1:</strong> Go to <a href="https://www.forexfactory.com/trade-explorer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Forex Factory Trade Explorer</a></p>
                    <p><strong>Step 2:</strong> Copy your top 10 traders data in this format (one per line):</p>
                    <code className="text-xs bg-background p-2 rounded block my-2">
                      rank,trader_name,trader_username,balance,profit_percent,trades
                    </code>
                    <p><strong>Example:</strong></p>
                    <code className="text-xs bg-background p-2 rounded block my-2">
                      1,John Doe,johndoe,25000,45.5,120
                    </code>
                    <p><strong>Step 3:</strong> Paste below and click "Upload Traders"</p>
                  </div>
                </details>
              </div>

              {/* Bulk Upload Form */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">📤 Upload Forex Factory Traders</h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-foreground">
                        CSV Data (Paste trader data) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCSVInput(generateCSVTemplate())}
                        className="text-xs text-primary hover:underline"
                      >
                        Load Template
                      </button>
                    </div>
                    <textarea
                      value={csvInput}
                      onChange={(e) => setCSVInput(e.target.value)}
                      placeholder={`rank,trader_name,trader_username,balance,profit_percent,trades
1,John Doe,johndoe,25000,45.5,120
2,Jane Smith,janesmith,22000,40.2,110`}
                      rows={8}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 rounded-lg bg-success/10 text-success border border-success/30">
                      <p className="text-sm font-medium">✅ Upload successful! Traders updated.</p>
                    </div>
                  )}

                  {uploadErrors.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/30">
                      <p className="text-sm font-medium mb-2">⚠️ Upload errors:</p>
                      <ul className="text-xs space-y-1">
                        {uploadErrors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCSVInput("");
                        setUploadErrors([]);
                        setUploadSuccess(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={isUploadingBulk || !csvInput.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingBulk ? "Uploading..." : "Upload Traders"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload History */}
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                <h3 className="text-base font-semibold text-foreground mb-3">📋 Recent Uploads</h3>
                {isLoadingMonitoring ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Loading integrations...</p>
                  </div>
                ) : forexFactoryIntegrations.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No Forex Factory integrations yet</p>
                  </div>
                ) : (
                  forexFactoryIntegrations.map((integration) => (
                    <div key={integration.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-foreground truncate">{integration.credential?.account_username || "N/A"}</p>
                          <p className="font-mono text-xs text-muted-foreground truncate">{integration.ff_account_username}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Status</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            integration.sync_status === 'success'
                              ? 'bg-success/10 text-success'
                              : integration.sync_status === 'error'
                              ? 'bg-destructive/10 text-destructive'
                              : integration.sync_status === 'syncing'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {integration.sync_status === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
                            {integration.sync_status === 'success' && <Check className="h-3 w-3" />}
                            {integration.sync_status === 'error' && <AlertCircle className="h-3 w-3" />}
                            {integration.sync_status.charAt(0).toUpperCase() + integration.sync_status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Updated</p>
                          <p className="text-xs text-muted-foreground">{integration.last_sync ? new Date(integration.last_sync).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div className="col-span-2 flex gap-2 justify-end">
                          <button onClick={() => handleManualSync(integration.id)} disabled={isSyncing} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"><RefreshCw className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteIntegration(integration.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">📋 Recent Uploads</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        Credential
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        FF Account
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                        Last Updated
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingMonitoring ? (
                      <tr>
                        <td colSpan={5} className="px-3 sm:px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">Loading integrations...</p>
                        </td>
                      </tr>
                    ) : forexFactoryIntegrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 sm:px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">No Forex Factory integrations yet</p>
                        </td>
                      </tr>
                    ) : (
                      forexFactoryIntegrations.map((integration) => (
                        <tr
                          key={integration.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm text-foreground">
                            {integration.credential?.account_username || "N/A"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm text-muted-foreground">
                            {integration.ff_account_username}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <div
                              className="group relative inline-block"
                              title={integration.last_error ? `Error: ${integration.last_error}` : undefined}
                            >
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                                  integration.sync_status === 'success'
                                    ? 'bg-success/10 text-success'
                                    : integration.sync_status === 'error'
                                    ? 'bg-destructive/10 text-destructive'
                                    : integration.sync_status === 'syncing'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {integration.sync_status === 'syncing' && (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                )}
                                {integration.sync_status === 'success' && (
                                  <Check className="h-3 w-3" />
                                )}
                                {integration.sync_status === 'error' && (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {integration.sync_status.charAt(0).toUpperCase() +
                                  integration.sync_status.slice(1)}
                              </span>
                              {integration.sync_status === 'error' && integration.last_error && (
                                <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                  {integration.last_error.substring(0, 100)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                            {integration.last_sync
                              ? new Date(integration.last_sync).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-right space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleManualSync(integration.id)}
                              disabled={isSyncing}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Sync</span>
                            </button>
                            <button
                              onClick={() => handleDeleteIntegration(integration.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sync History */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Recent Sync History</h3>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {syncHistory.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No sync history yet</p>
                    </div>
                  ) : (
                    syncHistory.map((sync) => (
                      <div key={sync.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-medium text-foreground text-sm capitalize">{sync.sync_type}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            sync.status === 'success'
                              ? 'bg-success/10 text-success'
                              : sync.status === 'error'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {sync.status.charAt(0).toUpperCase() + sync.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Records</p>
                            <p className="font-medium text-foreground">{sync.records_updated}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Synced</p>
                            <p className="text-xs text-muted-foreground">{new Date(sync.synced_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                          Records
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                          Synced
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center">
                            <p className="text-sm text-muted-foreground">No sync history yet</p>
                          </td>
                        </tr>
                      ) : (
                        syncHistory.map((sync) => (
                          <tr
                            key={sync.id}
                            className="border-b border-border hover:bg-card/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-xs sm:text-sm capitalize text-foreground">
                              {sync.sync_type}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  sync.status === 'success'
                                    ? 'bg-success/10 text-success'
                                    : sync.status === 'error'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-primary/10 text-primary'
                                }`}
                              >
                                {sync.status.charAt(0).toUpperCase() + sync.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                              {sync.records_updated}
                            </td>
                            <td className="px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                              {new Date(sync.synced_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              {/* Payment Account Settings */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                      💰 Payment Account Settings
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Configure your bank account for Nigerian payments and crypto wallets for international payments
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentSettingsForm(!showPaymentSettingsForm)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
                  >
                    <CreditCard className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{showPaymentSettingsForm ? "Cancel" : "Edit Settings"}</span>
                    <span className="sm:hidden">{showPaymentSettingsForm ? "✕" : "✎"}</span>
                  </button>
                </div>

                {showPaymentSettingsForm ? (
                  <form onSubmit={handleSavePaymentSettings} className="space-y-6">
                    {/* Nigerian Bank Account Section */}
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">🇳🇬 Nigerian Bank Account</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">These details will be shown to users from Nigeria</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Bank Name
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.nigerian_bank_name}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                nigerian_bank_name: e.target.value,
                              })
                            }
                            placeholder="e.g., GTBank, Access Bank"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Account Name
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.nigerian_account_name}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                nigerian_account_name: e.target.value,
                              })
                            }
                            placeholder="e.g., WFX Trading"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Account Number *
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.nigerian_account_number}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                nigerian_account_number: e.target.value,
                              })
                            }
                            placeholder="e.g., 0123456789"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            SWIFT Code
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.nigerian_swift_code}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                nigerian_swift_code: e.target.value,
                              })
                            }
                            placeholder="e.g., GTBINGLA"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Binance Section */}
                    <div className="space-y-4 border-t border-border pt-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">₿ Binance Pay</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">These details will be shown to international users</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Binance Pay ID *
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.binance_pay_id}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                binance_pay_id: e.target.value,
                              })
                            }
                            placeholder="Your Binance Pay ID"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Network
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.binance_network}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                binance_network: e.target.value,
                              })
                            }
                            placeholder="e.g., BNB, Ethereum"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bybit Section */}
                    <div className="space-y-4 border-t border-border pt-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">Bybit Wallet</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">These details will be shown to international users</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Wallet Address *
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.bybit_wallet_address}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                bybit_wallet_address: e.target.value,
                              })
                            }
                            placeholder="Your Bybit wallet address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Network
                          </label>
                          <Input
                            type="text"
                            value={paymentSettingsForm.bybit_network}
                            onChange={(e) =>
                              setPaymentSettingsForm({
                                ...paymentSettingsForm,
                                bybit_network: e.target.value,
                              })
                            }
                            placeholder="e.g., Bitcoin, Ethereum"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t border-border pt-6">
                      <button
                        type="button"
                        onClick={() => setShowPaymentSettingsForm(false)}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingPaymentSettings}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {isSavingPaymentSettings ? "Saving..." : "Save Settings"}
                      </button>
                    </div>
                  </form>
                ) : paymentSettings ? (
                  <div className="space-y-6">
                    {/* Nigerian Account Info */}
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3">🇳🇬 Nigerian Account</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="text-xs sm:text-sm">
                          <p className="text-muted-foreground mb-1">Bank</p>
                          <p className="font-medium text-foreground break-words">{paymentSettings.nigerian_bank_name || "—"}</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <p className="text-muted-foreground mb-1">Account Name</p>
                          <p className="font-medium text-foreground break-words">{paymentSettings.nigerian_account_name || "—"}</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <p className="text-muted-foreground mb-1">Account Number</p>
                          <p className="font-medium text-foreground font-mono break-all">{paymentSettings.nigerian_account_number || "—"}</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <p className="text-muted-foreground mb-1">SWIFT</p>
                          <p className="font-medium text-foreground font-mono break-all">{paymentSettings.nigerian_swift_code || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Crypto Wallets Info */}
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3">💱 International Payment Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs sm:text-sm border border-border rounded-lg p-3">
                          <p className="text-muted-foreground mb-1">Binance Pay ID</p>
                          <p className="font-medium text-foreground font-mono text-xs break-all">{paymentSettings.binance_pay_id || "—"}</p>
                          <p className="text-muted-foreground text-xs mt-1">Network: {paymentSettings.binance_network || "—"}</p>
                        </div>
                        <div className="text-xs sm:text-sm border border-border rounded-lg p-3">
                          <p className="text-muted-foreground mb-1">Bybit Wallet</p>
                          <p className="font-medium text-foreground font-mono text-xs break-all">{paymentSettings.bybit_wallet_address || "—"}</p>
                          <p className="text-muted-foreground text-xs mt-1">Network: {paymentSettings.bybit_network || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No payment settings configured yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Click "Edit Settings" to add your payment details</p>
                  </div>
                )}
              </div>

              {/* Pending Payments for Approval - Binance & Bybit Only */}
              <div className="rounded-lg border border-border bg-card p-4 md:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  💳 Pending Binance & Bybit Payments
                </h2>

                {isLoadingPendingPayments ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading pending payments...</p>
                  </div>
                ) : pendingPayments.filter((p) => p.payment_method === 'binance' || p.payment_method === 'bybit').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending Binance or Bybit payments at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments
                      .filter((p) => p.payment_method === 'binance' || p.payment_method === 'bybit')
                      .map((payment) => {
                        const methodBadgeClass =
                          payment.payment_method === 'binance'
                            ? 'bg-yellow-500/20 text-yellow-700'
                            : 'bg-purple-500/20 text-purple-700';

                        return (
                          <div
                            key={payment.id}
                            className="border border-border rounded-lg p-3 sm:p-4 hover:bg-card/50 transition-colors"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="font-medium text-foreground text-sm truncate">{payment.full_name}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground break-all text-xs sm:text-sm">{payment.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Country</p>
                                <p className="font-medium text-foreground text-sm">{payment.country}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Payment</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${methodBadgeClass}`}>
                                  {payment.payment_method === 'binance' ? '🟡 Binance' : '💜 Bybit'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 pb-4 border-b border-border">
                              <div>
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="font-medium text-foreground text-sm">$15 USD</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Registered</p>
                                <p className="font-medium text-foreground text-xs sm:text-sm">
                                  {new Date(payment.registered_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded text-xs inline-block">
                                  Pending
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">ID</p>
                                <p className="font-medium text-foreground text-xs font-mono">{payment.id.substring(0, 8)}...</p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                              <button
                                onClick={() => handleApprovePayment(payment.id, payment.full_name)}
                                disabled={approvingPaymentId === payment.id}
                                className="px-3 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-2"
                              >
                                {approvingPaymentId === payment.id ? (
                                  <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span className="hidden sm:inline">Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={16} />
                                    <span className="hidden md:inline">Approve & Send Credentials</span>
                                    <span className="md:hidden">Approve</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id, payment.full_name)}
                                disabled={approvingPaymentId === payment.id}
                                className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <AlertCircle size={16} />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Payment Confirmation Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  💳 Manual Payment Confirmation (Binance & Bybit)
                </h2>
                <PaymentConfirmation />
              </div>

              {/* Payment Alerts Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  ⚠️ Failed Payment Alerts
                </h2>
                <PaymentAlerts />
              </div>

              {/* Payment Monitoring Dashboard */}
              <PaymentMonitoring />
            </div>
          )}

          {/* Passwords Tab */}
          {activeTab === "passwords" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="rounded-lg border border-border bg-card p-4 md:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  🔐 Trader Account Passwords
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Search traders by username, email, or full name to view their account passwords
                </p>

                <div className="relative mb-6">
                  <input
                    type="text"
                    value={passwordSearch}
                    onChange={(e) => setPasswordSearch(e.target.value)}
                    placeholder="Search by username, email, or name..."
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {isLoadingPasswords ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading traders...</p>
                  </div>
                ) : filteredTradersWithPasswords.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {passwordSearch
                        ? "No traders found matching your search"
                        : "No traders with passwords yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTradersWithPasswords.map((trader) => (
                      <div
                        key={trader.id}
                        className="rounded-lg border border-border bg-card/50 p-4 space-y-3 hover:border-primary/50 transition-colors"
                      >
                        {/* Trader Info Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Username</p>
                            <p className="font-medium text-foreground text-sm break-words">
                              {trader.username}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="text-sm text-foreground break-all">{trader.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                            <p className="font-medium text-foreground text-sm">{trader.full_name}</p>
                          </div>
                        </div>

                        {/* Password Display */}
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">
                            Account Password
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 font-mono text-sm text-foreground bg-card/50 px-3 py-2 rounded break-all">
                              {trader.trader_password || "—"}
                            </code>
                            <button
                              onClick={() => {
                                if (trader.trader_password) {
                                  navigator.clipboard.writeText(trader.trader_password);
                                  alert("Password copied to clipboard!");
                                }
                              }}
                              disabled={!trader.trader_password}
                              className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        {/* Status Info */}
                        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-border">
                          <span className="text-muted-foreground">
                            Payment Status: {trader.payment_status || "Unknown"}
                          </span>
                          <span className="text-muted-foreground">
                            Registered: {new Date(trader.registered_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 md:p-6">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  <strong>ℹ️ Password Management Guide</strong>
                </p>
                <ul className="text-xs md:text-sm text-blue-600/90 dark:text-blue-400/90 space-y-1 list-disc list-inside">
                  <li>Use the search bar to quickly find traders by username, email, or name</li>
                  <li>Click "Copy" to copy a trader's password to your clipboard</li>
                  <li>Share passwords securely with traders who have forgotten theirs</li>
                  <li>Passwords are displayed here for admin reference only</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
