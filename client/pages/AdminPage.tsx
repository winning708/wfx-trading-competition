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
  linkMT5Account,
  getMT5IntegrationsWithDetails,
  triggerMT5SyncIntegration,
  triggerMT5SyncAll,
  getRecentMT5Syncs,
  deleteMT5Integration,
  MT5Integration,
  SyncHistoryRecord,
} from "@/lib/mt5";

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
    "traders" | "credentials" | "assignments" | "monitoring" | "payments"
  >("traders");

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
  const [mt5Integrations, setMt5Integrations] = useState<any[]>([]);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCredentialForLink, setSelectedCredentialForLink] = useState<string>("");
  const [mt5Form, setMt5Form] = useState({
    mt5_account_id: "",
    mt5_api_token: "",
    mt5_server_endpoint: "",
  });

  // Load traders on mount
  useEffect(() => {
    const loadTraders = async () => {
      try {
        setIsLoadingTraders(true);
        const data = await getLeaderboard();
        setTraders(data);
      } catch (error) {
        console.error("Error loading traders:", error);
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

  const loadCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const data = await getAllCredentials();
      setCredentials(data);
    } catch (error) {
      console.error("Error loading credentials:", error);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error("Error loading assignments:", error);
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

  const loadMonitoring = async () => {
    setIsLoadingMonitoring(true);
    try {
      const integrations = await getMT5IntegrationsWithDetails();
      setMt5Integrations(integrations);

      // Load sync history from the first integration if available
      if (integrations.length > 0) {
        const recentSyncs = await getRecentMT5Syncs(integrations[0].id, 10);
        setSyncHistory(recentSyncs);
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  const handleLinkMT5 = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Admin] MT5 Form Data:', {
      selectedCredentialForLink,
      mt5_account_id: mt5Form.mt5_account_id,
      mt5_api_token: mt5Form.mt5_api_token ? '***' : 'empty',
      mt5_server_endpoint: mt5Form.mt5_server_endpoint,
    });

    if (!selectedCredentialForLink || !mt5Form.mt5_account_id || !mt5Form.mt5_api_token || !mt5Form.mt5_server_endpoint) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await linkMT5Account(
      selectedCredentialForLink,
      mt5Form.mt5_account_id,
      mt5Form.mt5_api_token,
      mt5Form.mt5_server_endpoint
    );

    if (result.success) {
      setMt5Form({
        mt5_account_id: "",
        mt5_api_token: "",
        mt5_server_endpoint: "",
      });
      setSelectedCredentialForLink("");
      setShowLinkForm(false);
      await loadMonitoring();
      alert("✅ MT5 account linked successfully!");
    } else {
      alert(`Failed to link MT5 account: ${result.error}`);
    }
  };

  const handleManualSync = async (integrationId: string) => {
    setIsSyncing(true);
    try {
      const result = await triggerMT5SyncIntegration(integrationId);
      if (result.success) {
        await loadMonitoring();
        alert("✅ Sync triggered! Data will be updated shortly.");
      } else {
        const errorMsg = result.error || 'Unknown error - check server logs';
        alert(`❌ Sync failed:\n\n${errorMsg}\n\nCommon causes:\n- Invalid MT5 Account ID (should be trading account number, not UUID)\n- Wrong API Token or Server Endpoint\n- MT5 API is not responding`);
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
    if (!confirm("Sync data for all MT5 integrations?")) return;

    setIsSyncing(true);
    try {
      const result = await triggerMT5SyncAll();
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

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm("Delete this MT5 integration?")) return;

    const result = await deleteMT5Integration(integrationId);
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

      <div className="px-4 py-8 md:py-12">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage traders, upload credentials, and assign accounts
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("traders")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "traders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Traders ({traders.length})
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "credentials"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Key className="inline h-4 w-4 mr-2" />
              Credentials ({credentials.length})
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "assignments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="inline h-4 w-4 mr-2" />
              Assignments ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab("monitoring")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "monitoring"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="inline h-4 w-4 mr-2" />
              Monitoring
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "payments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="inline h-4 w-4 mr-2" />
              Payments
            </button>
          </div>

          {/* Traders Tab */}
          {activeTab === "traders" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Starting Balance
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Current Balance
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Profit %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTraders ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">Loading traders...</p>
                        </td>
                      </tr>
                    ) : traders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">No traders registered yet</p>
                        </td>
                      </tr>
                    ) : (
                      traders.map((trader, index) => (
                        <tr
                          key={index}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {trader.username}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {trader.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground">
                            ${trader.startingBalance.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-foreground">
                            ${trader.currentBalance.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Trading Account Credentials
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload credentials and they will be automatically assigned to unregistered traders
                  </p>
                </div>
                <button
                  onClick={() => setShowCredentialForm(!showCredentialForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Credential
                </button>
              </div>

              {/* Credential Form */}
              {showCredentialForm && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Upload New Trading Credential
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
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

              {/* Credentials List */}
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Account Number
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Broker
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCredentials ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">Loading credentials...</p>
                        </td>
                      </tr>
                    ) : credentials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">No credentials uploaded yet</p>
                        </td>
                      </tr>
                    ) : (
                      credentials.map((cred) => (
                        <tr
                          key={cred.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {cred.account_username}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm font-mono">
                            {cred.account_number}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {cred.broker}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
                          <td className="px-6 py-4 text-right">
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
              <div className="rounded-lg border border-success/50 bg-success/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">ℹ️ Auto-Assignment:</strong> When you upload a new credential, it's automatically assigned to the first unassigned trader. Use this section to reassign credentials between traders if needed.
                </p>
              </div>

              {/* Assignment Form */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Reassign Credential to Different Trader
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Trader
                    </label>
                    <select
                      value={selectedTrader}
                      onChange={(e) => setSelectedTrader(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Credential
                    </label>
                    <select
                      value={selectedCredential}
                      onChange={(e) => setSelectedCredential(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                      className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Assignments Table */}
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Trader
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Account Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Account Number
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Assigned
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAssignments ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">Loading assignments...</p>
                        </td>
                      </tr>
                    ) : assignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">No assignments yet</p>
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {assignment.trader?.full_name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {assignment.trader?.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-foreground">
                            {assignment.credential?.account_username || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                            {assignment.credential?.account_number || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
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
              <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                <h3 className="font-semibold text-foreground mb-2">MT5 Integration</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Link your trading accounts to MT5 REST API to automatically sync performance data. Your trader records will be updated with real-time trading metrics.
                </p>
                <details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary">
                    📖 How to set up MT5 API connection
                  </summary>
                  <div className="mt-3 space-y-2 ml-2 border-l-2 border-primary/30 pl-3">
                    <p><strong>1. Get MT5 Account ID</strong> - Your trading account number from JustMarkets</p>
                    <p><strong>2. Get API Token/Password</strong> - Request from your broker or use MetaApi (metaapi.cloud)</p>
                    <p><strong>3. Get Server Endpoint</strong> - REST API endpoint URL (e.g., https://api.broker.com)</p>
                    <p><strong>4. Link Account</strong> - Fill in the form below and click "Link MT5"</p>
                  </div>
                </details>
              </div>

              {/* MT5 Link Form */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">MT5 Integrations</h2>
                <button
                  onClick={() => setShowLinkForm(!showLinkForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Link MT5
                </button>
              </div>

              {showLinkForm && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Link MT5 Account</h3>

                  <form onSubmit={handleLinkMT5} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Select Trading Credential *
                        </label>
                        <select
                          value={selectedCredentialForLink}
                          onChange={(e) => setSelectedCredentialForLink(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Choose a credential...</option>
                          {credentials.map((cred) => (
                            <option key={cred.id} value={cred.id}>
                              {cred.account_username} ({cred.account_number})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          MT5 Account ID *
                        </label>
                        <Input
                          type="text"
                          value={mt5Form.mt5_account_id}
                          onChange={(e) =>
                            setMt5Form({
                              ...mt5Form,
                              mt5_account_id: e.target.value,
                            })
                          }
                          placeholder="e.g., 1234567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          API Token/Password *
                        </label>
                        <Input
                          type="password"
                          value={mt5Form.mt5_api_token}
                          onChange={(e) =>
                            setMt5Form({
                              ...mt5Form,
                              mt5_api_token: e.target.value,
                            })
                          }
                          placeholder="Your MT5 API token or password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Server Endpoint *
                        </label>
                        <Input
                          type="url"
                          value={mt5Form.mt5_server_endpoint}
                          onChange={(e) =>
                            setMt5Form({
                              ...mt5Form,
                              mt5_server_endpoint: e.target.value,
                            })
                          }
                          placeholder="e.g., https://mt5.broker.com/api"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowLinkForm(false)}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-card/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Link Account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sync Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync All
                </button>
              </div>

              {/* Integrations List */}
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Credential
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        MT5 Account ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Sync Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Last Sync
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingMonitoring ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">Loading integrations...</p>
                        </td>
                      </tr>
                    ) : mt5Integrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <p className="text-muted-foreground">No MT5 integrations yet</p>
                        </td>
                      </tr>
                    ) : (
                      mt5Integrations.map((integration) => (
                        <tr
                          key={integration.id}
                          className="border-b border-border hover:bg-card/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm text-foreground">
                            {integration.credential?.account_username || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                            {integration.mt5_account_id}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {integration.last_sync
                              ? new Date(integration.last_sync).toLocaleString()
                              : 'Never'}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleManualSync(integration.id)}
                              disabled={isSyncing}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Sync
                            </button>
                            <button
                              onClick={() => handleDeleteIntegration(integration.id)}
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

              {/* Sync History */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Sync History</h3>
                <div className="rounded-lg border border-border bg-card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Records Updated
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Synced
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center">
                            <p className="text-muted-foreground">No sync history yet</p>
                          </td>
                        </tr>
                      ) : (
                        syncHistory.map((sync) => (
                          <tr
                            key={sync.id}
                            className="border-b border-border hover:bg-card/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm capitalize text-foreground">
                              {sync.sync_type}
                            </td>
                            <td className="px-6 py-4">
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
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {sync.records_updated}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(sync.synced_at).toLocaleString()}
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
        </div>
      </div>
    </div>
  );
}
