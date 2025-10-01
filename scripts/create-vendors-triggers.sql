-- ================================================
-- Vendors Management System - Triggers & Functions
-- ================================================
-- Run this script AFTER create-vendors-tables-only.sql
-- This creates all triggers and functions for the vendors system

-- ================================================
-- Function to update updated_at timestamp
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Triggers for Auto-Update Timestamps
-- ================================================

-- Triggers for vendors table
DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for transactions table
DROP TRIGGER IF EXISTS update_vendor_transactions_updated_at ON public.vendor_transactions;
CREATE TRIGGER update_vendor_transactions_updated_at
    BEFORE UPDATE ON public.vendor_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for reviews table
DROP TRIGGER IF EXISTS update_vendor_reviews_updated_at ON public.vendor_reviews;
CREATE TRIGGER update_vendor_reviews_updated_at
    BEFORE UPDATE ON public.vendor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Function to Auto-Update Vendor Overall Rating
-- ================================================

CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_vendor_id UUID;
    v_avg_rating DECIMAL(3,2);
    v_review_count INTEGER;
BEGIN
    -- Get the vendor_id from NEW or OLD
    v_vendor_id := COALESCE(NEW.vendor_id, OLD.vendor_id);

    -- Skip if vendor_id is NULL
    IF v_vendor_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calculate average rating and count
    SELECT
        COALESCE(AVG(rating)::DECIMAL(3,2), 0.00),
        COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.vendor_reviews
    WHERE vendor_id = v_vendor_id;

    -- Update the vendor's overall rating and review count
    UPDATE public.vendors
    SET
        overall_rating = v_avg_rating,
        total_reviews = v_review_count
    WHERE id = v_vendor_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Trigger to Update Vendor Rating on Review Changes
-- ================================================

DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON public.vendor_reviews;
CREATE TRIGGER update_vendor_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_rating();
