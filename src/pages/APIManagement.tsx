import React, { useState } from 'react';
import { Key, Plus, Edit2, Trash2, Eye, EyeOff, Activity, AlertTriangle, CheckCircle, X, Database } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const APIManagement: React.FC = () => {
  const { apis, apiKeys, isLoading, addAPI, updateAPI, deleteAPI, addAPIKey, updateAPIKey, deleteAPIKey } = useSupabaseData();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'apis' | 'keys'>('apis');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAPIModal, setShowAddAPIModal] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [editingAPI, setEditingAPI] = useState<any>(null);
  const [editingKey, setEditingKey] = useState<any>(null);
  
  const [apiFormData, setAPIFormData] = useState({
    name: '',
    type: 'PRO' as 'FREE' | 'PRO' | 'DISABLED',
    global_buy_price: 0,
    global_sell_price: 0,
    default_credit_charge: 0,
    description: ''
  });

  const [keyFormData, setKeyFormData] = useState({
    name: '',
    provider: '',
    api_key: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleAddAPI = () => {
    setAPIFormData({
      name: '',
      type: 'PRO',
      global_buy_price: 0,
      global_sell_price: 0,
      default_credit_charge: 0,
      description: ''
    });
    setEditingAPI(null);
    setShowAddAPIModal(true);
  };

  const handleEditAPI = (api: any) => {
    setAPIFormData({
      name: api.name,
      type: api.type,
      global_buy_price: api.global_buy_price,
      global_sell_price: api.global_sell_price,
      default_credit_charge: api.default_credit_charge,
      description: api.description
    });
    setEditingAPI(api);
    setShowAddAPIModal(true);
  };

  const handleSubmitAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAPI) {
        await updateAPI(editingAPI.id, apiFormData);
      } else {
        await addAPI(apiFormData);
      }

      setShowAddAPIModal(false);
      setAPIFormData({
        name: '',
        type: 'PRO',
        global_buy_price: 0,
        global_sell_price: 0,
        default_credit_charge: 0,
        description: ''
      });
    } catch (error) {
      console.error('Error saving API:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAPI = (api: any) => {
    if (window.confirm(`Are you sure you want to delete ${api.name}?`)) {
      deleteAPI(api.id);
    }
  };

  const handleAddAPIKey = () => {
    setKeyFormData({
      name: '',
      provider: '',
      api_key: '',
      status: 'Active'
    });
    setEditingKey(null);
    setShowAddKeyModal(true);
  };

  const handleEditAPIKey = (apiKey: any) => {
    setKeyFormData({
      name: apiKey.name,
      provider: apiKey.provider,
      api_key: apiKey.api_key,
      status: apiKey.status
    });
    setEditingKey(apiKey);
    setShowAddKeyModal(true);
  };

  const handleSubmitAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingKey) {
        await updateAPIKey(editingKey.id, keyFormData);
      } else {
        await addAPIKey(keyFormData);
      }

      setShowAddKeyModal(false);
      setKeyFormData({
        name: '',
        provider: '',
        api_key: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAPIKey = (apiKey: any) => {
    if (window.confirm(`Are you sure you want to delete ${apiKey.name}?`)) {
      deleteAPIKey(apiKey.id);
    }
  };

  const handleToggleKeyStatus = (apiKey: any) => {
    const newStatus = apiKey.status === 'Active' ? 'Inactive' : 'Active';
    updateAPIKey(apiKey.id, { status: newStatus });
  };

  const filteredAPIs = apis.filter(api => 
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAPIKeys = apiKeys.filter(apiKey => 
    apiKey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apiKey.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskAPIKey = (key: string) => {
    const visiblePart = key.substring(0, 8);
    const maskedPart = '*'.repeat(24);
    return `${visiblePart}${maskedPart}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            API Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage APIs and API keys for PRO services
          </p>
        </div>
        <button 
          onClick={activeTab === 'apis' ? handleAddAPI : handleAddAPIKey}
          className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'apis' ? 'Add API' : 'Add API Key'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1">
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
            activeTab === 'apis'
              ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
              : isDark 
                ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="font-medium">APIs</span>
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
            activeTab === 'keys'
              ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
              : isDark 
                ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
          }`}
        >
          <Key className="w-4 h-4" />
          <span className="font-medium">API Keys</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total APIs
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apis.length}
              </p>
            </div>
            <Database className="w-8 h-8 text-cyber-teal" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active APIs
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apis.filter(api => api.type !== 'DISABLED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                API Keys
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apiKeys.length}
              </p>
            </div>
            <Key className="w-8 h-8 text-electric-blue" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Usage
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0).toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-neon-magenta" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <input
          type="text"
          placeholder={`Search ${activeTab === 'apis' ? 'APIs' : 'API keys'} by name...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
            isDark 
              ? 'bg-crisp-black text-white placeholder-gray-500' 
              : 'bg-white text-gray-900 placeholder-gray-400'
          }`}
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'apis' ? (
        /* APIs Table */
        <div className={`border border-cyber-teal/20 rounded-lg overflow-hidden ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b border-cyber-teal/20 ${
                isDark ? 'bg-crisp-black/50' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>API Name</th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Type</th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Buy Price</th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Sell Price</th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Credits</th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAPIs.map((api) => (
                  <tr key={api.id} className={`border-b border-cyber-teal/10 transition-colors ${
                    isDark ? 'hover:bg-crisp-black/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {api.name}
                        </span>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {api.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        api.type === 'FREE' ? 'bg-green-500/20 text-green-400' :
                        api.type === 'PRO' ? 'bg-neon-magenta/20 text-neon-magenta' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {api.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₹{api.global_buy_price}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₹{api.global_sell_price}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {api.default_credit_charge}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAPI(api)}
                          className={`p-2 rounded transition-colors ${
                            isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAPI(api)}
                          className={`p-2 rounded transition-colors ${
                            isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* API Keys Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAPIKeys.map((apiKey) => (
            <div key={apiKey.id} className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyber-gradient rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {apiKey.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {apiKey.provider}
                    </p>
                  </div>
                </div>
                <StatusBadge status={apiKey.status} />
              </div>

              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    API Key
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className={`flex-1 px-3 py-2 text-sm rounded border font-mono ${
                      isDark 
                        ? 'bg-crisp-black border-cyber-teal/30 text-gray-300' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      {showKeys[apiKey.id] ? apiKey.api_key : maskAPIKey(apiKey.api_key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className={`p-2 rounded transition-colors ${
                        isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                      }`}
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Used:</span>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Usage Count:</span>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {(apiKey.usage_count || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Usage Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Monthly Usage
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {Math.round(((apiKey.usage_count || 0) / 10000) * 100)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    isDark ? 'bg-crisp-black' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((apiKey.usage_count || 0) / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-cyber-teal/20">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditAPIKey(apiKey)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAPIKey(apiKey)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleToggleKeyStatus(apiKey)}
                  className="flex items-center space-x-2 transition-colors hover:opacity-80"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    apiKey.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                  } animate-pulse`} />
                  <span className={`text-xs ${
                    apiKey.status === 'Active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {apiKey.status === 'Active' ? 'Operational' : 'Inactive'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add API Modal */}
      {showAddAPIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAPI ? 'Edit API' : 'Add New API'}
              </h3>
              <button
                onClick={() => setShowAddAPIModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAPI} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Name *
                </label>
                <input
                  type="text"
                  required
                  value={apiFormData.name}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="e.g., Phone Prefill V2"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Type
                </label>
                <select
                  value={apiFormData.type}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    value={apiFormData.global_buy_price}
                    onChange={(e) => setAPIFormData(prev => ({ ...prev, global_buy_price: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sell Price (₹)
                  </label>
                  <input
                    type="number"
                    value={apiFormData.global_sell_price}
                    onChange={(e) => setAPIFormData(prev => ({ ...prev, global_sell_price: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Default Credit Charge
                </label>
                <input
                  type="number"
                  value={apiFormData.default_credit_charge}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, default_credit_charge: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={apiFormData.description}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Brief description of the API service"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAPIModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingAPI ? 'Update API' : 'Add API'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingKey ? 'Edit API Key' : 'Add New API Key'}
              </h3>
              <button
                onClick={() => setShowAddKeyModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAPIKey} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Name *
                </label>
                <input
                  type="text"
                  required
                  value={keyFormData.name}
                  onChange={(e) => setKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="e.g., Signzy Phone Verification"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Provider
                </label>
                <select
                  value={keyFormData.provider}
                  onChange={(e) => setKeyFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select Provider</option>
                  <option value="Signzy">Signzy</option>
                  <option value="Surepass">Surepass</option>
                  <option value="TrueCaller">TrueCaller</option>
                  <option value="EmailValidator">EmailValidator</option>
                  <option value="Custom">Custom Provider</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Key *
                </label>
                <input
                  type="text"
                  required
                  value={keyFormData.api_key}
                  onChange={(e) => setKeyFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal font-mono ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="sk_test_4f8b2c1a9e3d7f6b5a8c9e2d1f4b7a3c"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={keyFormData.status}
                  onChange={(e) => setKeyFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingKey ? 'Update API Key' : 'Add API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Results */}
      {((activeTab === 'apis' && filteredAPIs.length === 0) || (activeTab === 'keys' && filteredAPIKeys.length === 0)) && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-muted-graphite' : 'bg-gray-100'
          }`}>
            {activeTab === 'apis' ? (
              <Database className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <Key className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            No {activeTab === 'apis' ? 'APIs' : 'API Keys'} Found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search criteria or add a new {activeTab === 'apis' ? 'API' : 'API key'}.
          </p>
        </div>
      )}
    </div>
  );
};