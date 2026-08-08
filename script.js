document.addEventListener("DOMContentLoaded", function () {
        const btn = document.querySelector(".mobile-menu-btn");
        const ul = document.querySelector("nav ul");
        const navLinks = document.querySelectorAll("nav a");

        // Toggle mobile menu open/close
        btn.addEventListener("click", function () {
            ul.classList.toggle("nav-active");
        });

        navLinks.forEach(function (link) {
            link.addEventListener("click", function (e) {
                const parentLi = link.parentElement;
                const dropdown = parentLi.querySelector(".dropdown, .dropdown2");

                // Check if this link has a dropdown submenu
                if (dropdown) {
                    e.preventDefault(); // Stop page from jumping to top
                    // Toggle this specific dropdown visibility
                    if (dropdown.style.display === "block") {
                        dropdown.style.display = "none";
                    } else {
                        dropdown.style.display = "block";
                    }
                } else {
                    // Regular link: close the mobile menu when clicked
                    if (window.innerWidth <= 700) {
                        ul.classList.remove("nav-active");
                        
                        // Also close any open dropdowns
                        document.querySelectorAll(".dropdown, .dropdown2").forEach(d => {
                            d.style.display = "none";
                        });
                    }
                }
            });
        });
    });