Feature: Login

  @ui @smoke
  Scenario: Successful Login
    Given I navigate to the login page
    When I login with valid credentials
    Then I should be redirected to the orders page
  
  @ui @smoke
  Scenario: Failed Login with invalid credentials
       Given I navigate to the login page
       When I login with invalid credentials
       Then I should see an error message

  @ui @as-trader
  Scenario: Bypass login using saved session
    Given I navigate to the orders page
    Then I should be on the orders page
