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
} from "lucide-react";
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
    "traders" | "credentials" | "assignments"
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

    if (result) {
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
      alert("Credential uploaded successfully!");
    } else {
      alert("Failed to upload credential. Account number may already exist.");
    }
  };

  const handleAssignCredential = async () => {
    if (!selectedTrader || !selectedCredential) {
      alert("Please select both a trader and a credential");
      return;
    }

    const success = await assignCredentialToTrader(
      selectedTrader,
      selectedCredential
    );

    if (success) {
      setSelectedTrader("");
      setSelectedCredential("");
      await loadAssignments();
      alert("Credential assigned successfully!");
    } else {
      alert("Failed to assign credential");
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    const success = await removeAssignment(assignmentId);

    if (success) {
      await loadAssignments();
      alert("Assignment removed");
    } else {
      alert("Failed to remove assignment");
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (
      !confirm("Are you sure? This will remove all assignments for this credential.")
    ) {
      return;
    }

    const success = await deleteCredential(credentialId);

    if (success) {
      await loadCredentials();
      alert("Credential deleted");
    } else {
      alert("Failed to delete credential");
    }
  };

  // Get available credentials (not yet assigned)
  const availableCredentials = credentials.filter(
    (cred) => !assignments.some((a) => a.credential_id === cred.id)
  );

  // Get traders without assigned credentials
  const tradersWithoutCredentials = traders.filter(
    (trader) =>
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
                <h2 className="text-xl font-semibold text-foreground">
                  Trading Account Credentials
                </h2>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Upload New Trading Credential
                  </h3>

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
              {/* Assignment Form */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Assign Credential to Trader
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
                      {tradersWithoutCredentials.map((trader, index) => (
                        <option key={index} value={trader.id || `trader_${index}`}>
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
        </div>
      </div>
    </div>
  );
}
