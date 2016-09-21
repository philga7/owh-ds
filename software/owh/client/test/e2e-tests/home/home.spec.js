'use strict';

describe('home page', function() {

    var $translate;

    var owhHomePage = require('./homepage.po');
    var mortalityPage = require('../search/mortalitypage.po');

    beforeEach(function() {
        browser.get('/');
    });

    it('When I hit app url, I should be automatically redirected to home page ', function() {
        browser.get('/');
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl);
        //expect(browser.getTitle()).toEqual($translate.instant('app.title'))
    });

    it('I should see valid content under "On This Site You Can:" section', function(){
        expect(owhHomePage.getYouCanSectionContent().getText()).toContain('Compare health information and statistics across populations, filtering for factors such as sex, age, race, and other socioeconomic variables.');
        expect(owhHomePage.getYouCanSectionContent().getText()).toContain('Access dozens of datasets published by the Federal Government and gain insight into the main topics concerning women’s health today.');
        expect(owhHomePage.getYouCanSectionContent().getText()).toContain('Generate custom reports, graphs and maps to visually represent a wide range of information.');
    });

    it('When I click on Explore button in Quick Health Data Online section, ' +
        'I should get search page with default filter type mortality', function() {

        //element( by.className('qh-button')).click();
        owhHomePage.quickHealthExploreBtn.click();

        //check the page url
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "search");

        //check for default filter type
        expect(mortalityPage.getSelectedFilterType()).toEqual('Mortality');
    });

    it('When I click on Explore button in Youth Related card under Behavioral Risk, ' +
        'I should get search page with default filter type "Youth Risk Behavior"', function() {

        owhHomePage.mentalExplorerLink.click();

        //check the page url
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "search");
        //check for default filter type
        expect(mortalityPage.getSelectedFilterType()).toEqual('Youth Risk Behavior');
    });

    it('When I click on explore button in Birth card under womens health section, ' +
        'I should get a info modal', function() {
        owhHomePage.birthExplorerLink.click();
        expect(owhHomePage.getPhaseTwoPopupHeading()).toEqual('Work in progress');
    });
});