
-- Create a standardized view that combines all service items across systems
CREATE OR REPLACE VIEW unified_service_items AS
-- Service items from work orders
SELECT 
    'work_order' AS source_type,
    wo.id AS parent_id,
    wos.id AS item_id,
    wos.service_id,
    st.name AS service_name,
    wos.quantity,
    wos.unit_price,
    wos.commission_rate,
    wos.commission_type,
    wos.assigned_profile_id,
    wos.assigned_profiles,
    st.description
FROM work_order_services wos
JOIN work_orders wo ON wos.work_order_id = wo.id
LEFT JOIN service_types st ON wos.service_id = st.id

UNION ALL

-- Service items from invoices
SELECT 
    'invoice' AS source_type,
    i.id AS parent_id,
    ii.id AS item_id,
    ii.service_id,
    ii.service_name,
    ii.quantity,
    ii.unit_price,
    ii.commission_rate,
    ii.commission_type,
    ii.assigned_profile_id,
    NULL AS assigned_profiles,
    ii.description
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id

UNION ALL

-- Service items from estimates
SELECT 
    'estimate' AS source_type,
    e.id AS parent_id,
    ei.id AS item_id,
    ei.service_id,
    ei.service_name,
    ei.quantity,
    ei.unit_price,
    NULL AS commission_rate,
    NULL AS commission_type,
    NULL AS assigned_profile_id,
    NULL AS assigned_profiles,
    ei.description
FROM estimate_items ei
JOIN estimates e ON ei.estimate_id = e.id;
