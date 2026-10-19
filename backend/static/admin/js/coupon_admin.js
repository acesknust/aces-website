/**
 * Coupon Admin JavaScript
 * Auto-generates coupon codes based on owner role
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // Only run on coupon add/change page
        if (!document.getElementById('id_code')) return;

        const codeField = document.getElementById('id_code');
        const roleField = document.getElementById('id_owner_role');
        const nameField = document.getElementById('id_owner_name');

        // Create "Generate Code" button
        const generateBtn = document.createElement('button');
        generateBtn.type = 'button';
        generateBtn.textContent = '🎲 Generate Code';
        generateBtn.style.cssText = 'margin-left: 10px; padding: 5px 15px; background: #417690; color: white; border: none; border-radius: 4px; cursor: pointer;';

        generateBtn.addEventListener('click', function () {
            const ownerName = nameField ? nameField.value : '';
            const ownerRole = roleField ? roleField.value : '';

            // Make AJAX request to generate code
            fetch(`/admin/shop/coupon/generate-code/?owner_name=${encodeURIComponent(ownerName)}&owner_role=${encodeURIComponent(ownerRole)}`)
                .then(response => response.json())
                .then(data => {
                    codeField.value = data.code;
                    codeField.style.backgroundColor = '#e6ffe6';
                    setTimeout(() => {
                        codeField.style.backgroundColor = '';
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error generating code:', error);
                    alert('Error generating code. Please try again.');
                });
        });

        // Insert button after code field
        codeField.parentNode.insertBefore(generateBtn, codeField.nextSibling);

        // Add hover effect
        generateBtn.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#205067';
        });
        generateBtn.addEventListener('mouseout', function () {
            this.style.backgroundColor = '#417690';
        });
    });
})();
