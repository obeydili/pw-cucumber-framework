Feature: Login

  @ui @smoke
  Scenario: Successful Login
    Given I navigate to the login page
    When I login with valid credentials
    Then I should be redirected to the orders page
  
  @ui @smoke
  Scenario: Failed Login with invalid credentials
    Given I navigate to the login page
    When I login with username "hacker" and password "badpass"
    Then I should see an error message