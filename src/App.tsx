import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Marketplace } from './components/Marketplace';
import { ExpiringSoonSection } from './components/ExpiringSoonSection';
import { FoodDetailsModal } from './components/FoodDetailsModal';
import { ClaimPassModal } from './components/ClaimPassModal';
import { AddListingModal } from './components/AddListingModal';
import { EditListingModal } from './components/EditListingModal';
import { ImpactDashboard } from './components/ImpactDashboard';
import { UserDashboard } from './components/UserDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RatingModal } from './components/RatingModal';
import { AuthModal } from './components/AuthModal';
import { LocationModal } from './components/LocationModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { FoodListing, Claim, Rating } from './types';
import { api } from './services/api';

function MainApp() {
  const { userLocation } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Listings State
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);

  // Modals State
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [activeClaimPass, setActiveClaimPass] = useState<Claim | null>(null);
  const [ratingClaim, setRatingClaim] = useState<Claim | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<FoodListing | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Load listings from API
  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const res = await api.listings.getAll({
        user_lat: userLocation.lat,
        user_lng: userLocation.lng
      });
      setListings(res.listings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userLocation]);

  // Handle successful claim: update local listing available quantity
  const handleClaimSuccess = (claim: Claim, updatedListing: FoodListing) => {
    setListings(prev =>
      prev.map(l => (l.id === updatedListing.id ? updatedListing : l))
    );
    if (selectedListing?.id === updatedListing.id) {
      setSelectedListing(updatedListing);
    }
    // Automatically present the digital pickup pass
    setActiveClaimPass(claim);
  };

  const handleListingCreated = (newListing: FoodListing) => {
    setListings(prev => [newListing, ...prev]);
  };

  const handleListingUpdated = (updated: FoodListing) => {
    setListings(prev => prev.map(l => (l.id === updated.id ? updated : l)));
  };

  const handleRatingSubmitted = (_newRating: Rating) => {
    fetchListings();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onFindFood={() => {
                setActiveTab('marketplace');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onListFood={() => setIsAddModalOpen(true)}
            />

            <ExpiringSoonSection
              listings={listings}
              onSelect={(item) => setSelectedListing(item)}
              onClaimDirect={(item) => setSelectedListing(item)}
              onViewAllExpiring={() => {
                setActiveTab('expiring');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <div className="pt-8">
              <Marketplace
                listings={listings}
                onSelectListing={(item) => setSelectedListing(item)}
                onClaimDirect={(item) => setSelectedListing(item)}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                userLocationName={userLocation.name}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            </div>

            <HowItWorks />
          </>
        )}

        {activeTab === 'marketplace' && (
          <Marketplace
            listings={listings}
            onSelectListing={(item) => setSelectedListing(item)}
            onClaimDirect={(item) => setSelectedListing(item)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            userLocationName={userLocation.name}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {activeTab === 'expiring' && (
          <div className="py-8 bg-slate-50 min-h-screen">
            <ExpiringSoonSection
              listings={listings}
              onSelect={(item) => setSelectedListing(item)}
              onClaimDirect={(item) => setSelectedListing(item)}
              onViewAllExpiring={() => {}}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-heading">
                All Fast-Expiring Items Ready for Rescue
              </h3>
              <Marketplace
                listings={listings.filter(l => {
                  const diff = new Date(l.expiry_at).getTime() - Date.now();
                  return diff > 0 && diff <= 3 * 60 * 60 * 1000 && l.available_quantity > 0;
                })}
                onSelectListing={(item) => setSelectedListing(item)}
                onClaimDirect={(item) => setSelectedListing(item)}
                selectedCategory="All"
                setSelectedCategory={setSelectedCategory}
                userLocationName={userLocation.name}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'impact' && <ImpactDashboard />}

        {activeTab === 'how-it-works' && (
          <div className="py-8">
            <HowItWorks />
          </div>
        )}

        {activeTab === 'user-dashboard' && (
          <UserDashboard
            onOpenPass={(claim) => setActiveClaimPass(claim)}
            onOpenRating={(claim) => setRatingClaim(claim)}
            onExploreMore={() => setActiveTab('marketplace')}
          />
        )}

        {activeTab === 'provider-dashboard' && (
          <ProviderDashboard
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onEditListing={(item) => setEditingListing(item)}
            onViewListing={(item) => setSelectedListing(item)}
          />
        )}

        {activeTab === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <FoodDetailsModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onClaimSuccess={handleClaimSuccess}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <ClaimPassModal
        claim={activeClaimPass}
        onClose={() => setActiveClaimPass(null)}
        onClaimCompleted={(claim) => {
          setActiveClaimPass(claim);
          fetchListings();
        }}
        onOpenRating={(claim) => setRatingClaim(claim)}
      />

      <AddListingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onListingCreated={handleListingCreated}
      />

      <EditListingModal
        listing={editingListing}
        onClose={() => setEditingListing(null)}
        onListingUpdated={handleListingUpdated}
      />

      <RatingModal
        claim={ratingClaim}
        onClose={() => setRatingClaim(null)}
        onRatingSubmitted={handleRatingSubmitted}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
