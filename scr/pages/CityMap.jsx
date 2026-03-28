import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Locate, Layers, AlertTriangle, Loader2, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import IssueMap from '@/components/map/IssueMap';
import StatusBadge from '@/components/shared/StatusBadge';
import CategoryIcon from '@/components/shared/CategoryIcon';

const YAVATMAL_LANDMARKS = [
  { name: 'Yavatmal City Center', lat: 20.3888, lng: 78.1204 },
  { name: 'Yavatmal Railway Station', lat: 20.3812, lng: 78.1189 },
  { name: 'Gandhi Chowk', lat: 20.3905, lng: 78.1230 },
  { name: 'Bus Stand', lat: 20.3870, lng: 78.1250 },
  { name: 'Civil Hospital', lat: 20.3940, lng: 78.1170 },
  { name: 'Collector Office', lat: 20.3920, lng: 78.1200 },
  { name: 'Lohara Area', lat: 20.3855, lng: 78.1150 },
  { name: 'Dhamangaon Road', lat: 20.3960, lng: 78.1280 },
];

export default function CityMap() {
  const { lang } = useOutletContext() || { lang: 'en' };
  const [userLocation, setUserLocation] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [locating, setLocating] = useState(false);

  const { data: issues = [] } = useQuery({
    queryKey: ['map-issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 500),
  });

  const mappedIssues = issues.filter(i => i.lat && i.lng);

  const filteredIssues = mappedIssues.filter(i =>
    statusFilter === 'all' || i.status === statusFilter
  );

  const stats = {
    total: mappedIssues.length,
    submitted: mappedIssues.filter(i => i.status === 'submitted').length,
    in_progress: mappedIssues.filter(i => i.status === 'in_progress').length,
    resolved: mappedIssues.filter(i => i.status === 'resolved').length,
  };

  // Get live GPS location
  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setFlyTo([coords.lat, coords.lng]);
        setLocating(false);
        toast.success('Located! Showing your position on map.');
      },
      () => {
        setLocating(false);
        toast.error('Could not get GPS location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search handler - search landmarks + issues
  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) { setSearchResults([]); return; }
    const q = value.toLowerCase();
    const landmarkMatches = YAVATMAL_LANDMARKS.filter(l => l.name.toLowerCase().includes(q));
    const issueMatches = mappedIssues.filter(i =>
      i.title?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q)
    ).slice(0, 3);
    setSearchResults([
      ...landmarkMatches.map(l => ({ type: 'landmark', ...l })),
      ...issueMatches.map(i => ({ type: 'issue', name: i.title, lat: i.lat, lng: i.lng, issue: i })),
    ].slice(0, 6));
  };

  const handleSelectResult = (result) => {
    setFlyTo([result.lat, result.lng]);
    setSearch(result.name);
    setSearchResults([]);
    if (result.type === 'issue') setSelectedIssue(result.issue);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-foreground">City Live Map</h1>
        <p className="text-xs text-muted-foreground">Interactive issue map of Yavatmal — OpenStreetMap</p>
      </div>

      {/* Search + Controls Row */}
      <div className="px-4 pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search places, issues, wards..."
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border rounded-lg shadow-lg z-50 mt-1 overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(r)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-left"
                >
                  {r.type === 'landmark'
                    ? <MapPin className="w-4 h-4 text-primary shrink-0" />
                    : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  }
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.type === 'issue' && <p className="text-[10px] text-muted-foreground capitalize">{r.issue?.category} · {r.issue?.status?.replace('_', ' ')}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={locating}
            className="gap-1.5 text-xs shrink-0"
          >
            {locating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Locate className="w-3.5 h-3.5" />
            }
            {locating ? 'Locating...' : 'My Location'}
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 h-9 text-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 mx-4 rounded-xl overflow-hidden border relative">
        <IssueMap
          issues={filteredIssues}
          userLocation={userLocation}
          flyTo={flyTo}
          height="100%"
        />

        {/* Legend overlay — always visible */}
        <div className="absolute bottom-3 left-3 z-[500] bg-card/95 backdrop-blur-sm rounded-xl p-3 border shadow-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Legend</span>
          </div>
          {[
            { color: '#f59e0b', label: 'Submitted' },
            { color: '#3b82f6', label: 'In Progress' },
            { color: '#10b981', label: 'Resolved' },
            { color: '#ef4444', label: 'Rejected' },
            { color: '#6366f1', label: 'Your Location' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 py-0.5">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm shrink-0" style={{ background: color }} />
              <span className="text-[10px] text-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Stats overlay top-right */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1">
          {[
            { val: stats.total, label: 'Total', color: 'bg-foreground/80 text-background' },
            { val: stats.submitted, label: 'Pending', color: 'bg-amber-500 text-white' },
            { val: stats.in_progress, label: 'Active', color: 'bg-blue-500 text-white' },
            { val: stats.resolved, label: 'Done', color: 'bg-green-500 text-white' },
          ].map(({ val, label, color }) => (
            <div key={label} className={`${color} rounded-lg px-2.5 py-1 text-center shadow-md min-w-[52px]`}>
              <p className="text-sm font-bold leading-none">{val}</p>
              <p className="text-[9px] opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom issue list preview */}
      <div className="px-4 pt-2 pb-1">
        <p className="text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground">{filteredIssues.length}</span> issues on map
          {filteredIssues.length < issues.length && (
            <span className="ml-1">({issues.length - filteredIssues.length} without GPS)</span>
          )}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredIssues.slice(0, 8).map(issue => (
            <button
              key={issue.id}
              onClick={() => setFlyTo([issue.lat, issue.lng])}
              className="shrink-0 flex items-center gap-2 bg-card border rounded-lg px-3 py-2 hover:border-primary/50 transition-colors text-left"
            >
              <CategoryIcon category={issue.category} size="sm" />
              <div>
                <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{issue.title}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{issue.status?.replace('_', ' ')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
