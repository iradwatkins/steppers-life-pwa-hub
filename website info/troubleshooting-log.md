I have resolved the login and registration issues by updating `authService.ts` to use the centralized `apiClient.ts`, which ensures all authentication requests are sent to the correct API endpoint.

This change addresses the root cause of the problem, which was an incorrect API URL hardcoded in `authService.ts`. By centralizing API calls through `apiClient.ts`, I have also improved the application's maintainability and consistency.

Now, with the issue resolved, I recommend running the application and verifying that the login and registration functionalities are working as expected. If you encounter any further issues, please let me know, and I will be happy to assist. 