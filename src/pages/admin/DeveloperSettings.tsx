
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { 
  Code, 
  Database, 
  Key, 
  FileText, 
  Palette, 
  Globe, 
  Shield, 
  BarChart, 
  Settings, 
  RotateCcw, 
  LoaderCircle, 
  Trash2, 
  Plus,
  Copy,
  RefreshCcw,
  Download,
  Upload,
  Activity
} from "lucide-react"

export default function DeveloperSettings() {
  const { isAdmin } = useAdminStatus()
  const [activeTab, setActiveTab] = useState("performance")
  const [cpuUsage, setCpuUsage] = useState(32)
  const [memoryUsage, setMemoryUsage] = useState(45)
  const [selectedTheme, setSelectedTheme] = useState("system")
  const [fontSize, setFontSize] = useState(16)
  const [kernelSize, setKernelSize] = useState(3)
  const [logLevel, setLogLevel] = useState("info")
  const [enableMetrics, setEnableMetrics] = useState(true)
  const [enableTelemetry, setEnableTelemetry] = useState(false)
  
  // Sample API keys
  const [apiKeys] = useState([
    { id: 1, name: "Production API Key", key: "sk_prod_2aB7cD8eF9gH0iJ1kL2m", lastUsed: "2023-05-15", usageCount: 1458, active: true },
    { id: 2, name: "Development API Key", key: "sk_dev_3bC8dE9fG0hI1jJ2kL3m", lastUsed: "2023-05-10", usageCount: 721, active: true },
    { id: 3, name: "Testing API Key", key: "sk_test_4cD9eF0gH1iJ2jK3lL4m", lastUsed: "2023-04-28", usageCount: 345, active: false },
  ])

  // Sample connections
  const [connections] = useState([
    { id: 1, name: "Primary Database", host: "db.example.com", status: "Connected", type: "PostgreSQL" },
    { id: 2, name: "Analytics Database", host: "analytics.example.com", status: "Disconnected", type: "MySQL" },
    { id: 3, name: "Cache Server", host: "cache.example.com", status: "Connected", type: "Redis" },
  ])

  const handleClearCache = () => {
    toast.success("Cache cleared successfully")
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("API key copied to clipboard")
  }

  const handleDatabaseBackup = () => {
    toast.success("Database backup initiated")
  }

  const handleRestoreBackup = () => {
    toast.success("Backup restoration initiated")
  }

  const handleUpdateKernelSize = (value: number[]) => {
    setKernelSize(value[0])
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
          <p className="text-muted-foreground">
            Configure advanced system settings for developers and administrators.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between">
            <TabsList className="grid grid-cols-4 w-full md:w-auto md:grid-cols-9">
              <TabsTrigger value="performance" className="flex gap-1 items-center">
                <Activity className="h-4 w-4" />
                <span className="hidden md:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="apikeys" className="flex gap-1 items-center">
                <Key className="h-4 w-4" />
                <span className="hidden md:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex gap-1 items-center">
                <Database className="h-4 w-4" />
                <span className="hidden md:inline">Database</span>
              </TabsTrigger>
              <TabsTrigger value="logging" className="flex gap-1 items-center">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Logging</span>
              </TabsTrigger>
              <TabsTrigger value="themes" className="flex gap-1 items-center">
                <Palette className="h-4 w-4" />
                <span className="hidden md:inline">Themes</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex gap-1 items-center">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex gap-1 items-center">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex gap-1 items-center">
                <BarChart className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex gap-1 items-center">
                <Code className="h-4 w-4" />
                <span className="hidden md:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Monitor system resource usage and manage performance settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="cpu">CPU Usage</Label>
                    <span className="text-sm text-muted-foreground">{cpuUsage}%</span>
                  </div>
                  <Progress value={cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="memory">Memory Usage</Label>
                    <span className="text-sm text-muted-foreground">{memoryUsage}%</span>
                  </div>
                  <Progress value={memoryUsage} className="h-2" />
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-size">Cache Size Limit</Label>
                    <span className="text-sm text-muted-foreground">512 MB</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} step={10} />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2" onClick={handleClearCache}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                <Button onClick={() => toast.success("Performance settings saved")}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apikeys" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>API Keys Management</CardTitle>
                  <CardDescription>
                    Create and manage API keys for external service integration.
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New API Key
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>{apiKey.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {apiKey.key.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{apiKey.lastUsed}</TableCell>
                        <TableCell>{apiKey.usageCount}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${apiKey.active ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`h-2 w-2 rounded-full ${apiKey.active ? 'bg-green-600' : 'bg-red-600'}`} />
                            {apiKey.active ? 'Active' : 'Inactive'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCopyApiKey(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.success("API key refreshed")}>
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.success("API key deleted")}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>
                  Manage database connections and perform maintenance tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell>{connection.name}</TableCell>
                        <TableCell>{connection.host}</TableCell>
                        <TableCell>{connection.type}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${connection.status === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`h-2 w-2 rounded-full ${connection.status === 'Connected' ? 'bg-green-600' : 'bg-red-600'}`} />
                            {connection.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.success(`${connection.status === 'Connected' ? 'Disconnected from' : 'Connected to'} ${connection.name}`)}
                          >
                            {connection.status === 'Connected' ? 'Disconnect' : 'Connect'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Backup & Restore</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" onClick={handleDatabaseBackup}>
                        <Download className="mr-2 h-4 w-4" />
                        Backup Database
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleRestoreBackup}>
                        <Upload className="mr-2 h-4 w-4" />
                        Restore from Backup
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" onClick={() => toast.success("Database optimization complete")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Optimize Database
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => toast.success("Database vacuum complete")}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Vacuum Database
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logging Tab */}
          <TabsContent value="logging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logging Configuration</CardTitle>
                <CardDescription>
                  Configure system logging and monitoring settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="log-level">Log Level</Label>
                      <Select value={logLevel} onValueChange={setLogLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select log level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trace">Trace</SelectItem>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="fatal">Fatal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-format">Log Format</Label>
                      <Select defaultValue="json">
                        <SelectTrigger>
                          <SelectValue placeholder="Select log format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-retention">Log Retention (days)</Label>
                      <Input type="number" id="log-retention" defaultValue="30" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Log Categories</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-system" className="cursor-pointer">System Logs</Label>
                          <Switch id="log-system" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-app" className="cursor-pointer">Application Logs</Label>
                          <Switch id="log-app" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-access" className="cursor-pointer">Access Logs</Label>
                          <Switch id="log-access" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-error" className="cursor-pointer">Error Logs</Label>
                          <Switch id="log-error" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-audit" className="cursor-pointer">Audit Logs</Label>
                          <Switch id="log-audit" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label>Advanced Options</Label>
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="log-compression" className="cursor-pointer">Enable Log Compression</Label>
                      <Switch id="log-compression" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="log-remote" className="cursor-pointer">Remote Logging</Label>
                      <Switch id="log-remote" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="log-stacktrace" className="cursor-pointer">Include Stack Traces</Label>
                      <Switch id="log-stacktrace" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Logging settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <CardDescription>
                  Customize the application appearance and visual settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme-select">Theme Mode</Label>
                      <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color-scheme">Color Scheme</Label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="font-size">Font Size ({fontSize}px)</Label>
                      </div>
                      <Slider 
                        id="font-size" 
                        defaultValue={[16]} 
                        min={12} 
                        max={24} 
                        step={1}
                        onValueChange={(values) => setFontSize(values[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density">UI Density</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger>
                          <SelectValue placeholder="Select density" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme Preview</Label>
                      <div className={`rounded-md border h-80 p-4 ${selectedTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <h3 className="font-semibold" style={{ fontSize: `${fontSize}px` }}>Preview Title</h3>
                            <p className="text-muted-foreground" style={{ fontSize: `${fontSize - 2}px` }}>This is how your content will appear with the current settings.</p>
                          </div>
                          <div className="space-y-2">
                            <div className={`rounded p-2 ${selectedTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p style={{ fontSize: `${fontSize - 2}px` }}>Card element</p>
                            </div>
                            <div className="flex gap-2">
                              <button className={`px-3 py-1 rounded ${selectedTheme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`} style={{ fontSize: `${fontSize - 2}px` }}>
                                Primary Button
                              </button>
                              <button className={`px-3 py-1 rounded border ${selectedTheme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`} style={{ fontSize: `${fontSize - 2}px` }}>
                                Secondary Button
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Advanced Appearance Options</Label>
                  <div className="rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations" className="cursor-pointer">Enable Animations</Label>
                      <Switch id="animations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rounded-corners" className="cursor-pointer">Rounded Corners</Label>
                      <Switch id="rounded-corners" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="shadows" className="cursor-pointer">Show Shadows</Label>
                      <Switch id="shadows" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contrast" className="cursor-pointer">High Contrast Mode</Label>
                      <Switch id="contrast" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Theme settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Settings</CardTitle>
                <CardDescription>
                  Configure network connections and proxy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                      <Input type="number" id="timeout" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retry-count">Max Retry Count</Label>
                      <Input type="number" id="retry-count" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="throttling">Request Throttling</Label>
                      <Select defaultValue="none">
                        <SelectTrigger>
                          <SelectValue placeholder="Select throttling option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low (100 req/min)</SelectItem>
                          <SelectItem value="medium">Medium (50 req/min)</SelectItem>
                          <SelectItem value="high">High (10 req/min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Proxy Configuration</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="use-proxy" className="cursor-pointer">Use Proxy</Label>
                          <Switch id="use-proxy" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxy-host">Proxy Host</Label>
                          <Input type="text" id="proxy-host" placeholder="proxy.example.com" disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxy-port">Port</Label>
                          <Input type="number" id="proxy-port" placeholder="8080" disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label>Advanced Network Options</Label>
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="keep-alive" className="cursor-pointer">HTTP Keep-Alive</Label>
                      <Switch id="keep-alive" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compression" className="cursor-pointer">Content Compression</Label>
                      <Switch id="compression" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dns-prefetch" className="cursor-pointer">DNS Prefetching</Label>
                      <Switch id="dns-prefetch" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="http2" className="cursor-pointer">Enable HTTP/2</Label>
                      <Switch id="http2" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Network settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Configure security settings and access controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input type="number" id="session-timeout" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input type="number" id="max-login-attempts" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select defaultValue="strong">
                        <SelectTrigger>
                          <SelectValue placeholder="Select password policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                          <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                          <SelectItem value="strong">Strong (8+ chars, mixed case, numbers)</SelectItem>
                          <SelectItem value="very-strong">Very Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Authentication Options</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="two-factor" className="cursor-pointer">Require Two-Factor Authentication</Label>
                          <Switch id="two-factor" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sso" className="cursor-pointer">Single Sign-On (SSO)</Label>
                          <Switch id="sso" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="device-verification" className="cursor-pointer">Device Verification</Label>
                          <Switch id="device-verification" defaultChecked />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-lockout">Account Lockout Duration (minutes)</Label>
                      <Input type="number" id="account-lockout" defaultValue="30" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label>Advanced Security Options</Label>
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ip-restriction" className="cursor-pointer">IP Address Restrictions</Label>
                      <Switch id="ip-restriction" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-logging" className="cursor-pointer">Audit Logging</Label>
                      <Switch id="audit-logging" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brute-force" className="cursor-pointer">Brute Force Protection</Label>
                      <Switch id="brute-force" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-security" className="cursor-pointer">Content Security Policy</Label>
                      <Switch id="content-security" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Security settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Settings</CardTitle>
                <CardDescription>
                  Configure usage tracking and analytics settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-metrics" className="cursor-pointer">Enable Usage Metrics</Label>
                        <Switch id="enable-metrics" checked={enableMetrics} onCheckedChange={setEnableMetrics} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Collect anonymous usage statistics to help improve the application.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-telemetry" className="cursor-pointer">Enable Telemetry</Label>
                        <Switch id="enable-telemetry" checked={enableTelemetry} onCheckedChange={setEnableTelemetry} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Collect detailed telemetry data for debugging and performance optimization.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reporting-interval">Reporting Interval (minutes)</Label>
                      <Input type="number" id="reporting-interval" defaultValue="15" disabled={!enableMetrics} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Data Collection Settings</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="collect-errors" className="cursor-pointer">Collect Error Reports</Label>
                          <Switch id="collect-errors" defaultChecked disabled={!enableMetrics} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="collect-usage" className="cursor-pointer">Collect Usage Patterns</Label>
                          <Switch id="collect-usage" defaultChecked disabled={!enableMetrics} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="collect-performance" className="cursor-pointer">Collect Performance Metrics</Label>
                          <Switch id="collect-performance" defaultChecked disabled={!enableMetrics} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                      <Select defaultValue="90" disabled={!enableMetrics}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">365 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label>Advanced Analytics Configuration</Label>
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-mode" className="cursor-pointer">Enhanced Privacy Mode</Label>
                      <Switch id="privacy-mode" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tracking-id">Analytics Tracking ID</Label>
                      <Input type="text" id="tracking-id" placeholder="UA-XXXXXXXXX-X" disabled={!enableMetrics} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ip-anonymization" className="cursor-pointer">IP Anonymization</Label>
                      <Switch id="ip-anonymization" defaultChecked disabled={!enableMetrics} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Analytics settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced technical settings and developer options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue placeholder="Select debug mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="errors">Errors Only</SelectItem>
                          <SelectItem value="warnings">Warnings & Errors</SelectItem>
                          <SelectItem value="verbose">Verbose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="morphology-kernel-size">Morphology Kernel Size ({kernelSize}x{kernelSize})</Label>
                      </div>
                      <Slider 
                        id="morphology-kernel-size" 
                        defaultValue={[3]} 
                        min={1} 
                        max={9} 
                        step={2}
                        onValueChange={handleUpdateKernelSize}
                      />
                      <p className="text-xs text-muted-foreground">Kernel size for morphological operations on image processing.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="worker-threads">Worker Threads</Label>
                      <Input type="number" id="worker-threads" defaultValue="4" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Developer Options</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dev-mode" className="cursor-pointer">Developer Mode</Label>
                          <Switch id="dev-mode" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="trace-rendering" className="cursor-pointer">Trace Rendering</Label>
                          <Switch id="trace-rendering" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="debug-api" className="cursor-pointer">Debug API Calls</Label>
                          <Switch id="debug-api" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experimental">Experimental Features</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="exp-ui" className="cursor-pointer">Experimental UI</Label>
                          <Switch id="exp-ui" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="exp-algorithm" className="cursor-pointer">Experimental Algorithms</Label>
                          <Switch id="exp-algorithm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label className="text-red-500">Danger Zone</Label>
                  <div className="rounded-md border border-red-200 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Reset All Settings</h4>
                        <p className="text-sm text-muted-foreground">Reset all settings to their default values.</p>
                      </div>
                      <Button variant="destructive" onClick={() => toast.success("All settings have been reset to defaults")}>
                        Reset
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Clear All Data</h4>
                        <p className="text-sm text-muted-foreground">This will permanently delete all cached data.</p>
                      </div>
                      <Button variant="destructive" onClick={() => toast.success("All data has been cleared")}>
                        Clear Data
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Advanced settings saved")}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
