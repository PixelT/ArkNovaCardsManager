import animals from '../data/animals.json';
import sponsors from '../data/sponsors.json';

interface IConfig {
    [key: string]: string;
};

interface IDataCards {
    [key: string]: Array<any>;
};
interface IDataStats {
    [key: number | string]: any;
};

interface IDataFilters {
    [key: string]: Array<string> | number;
}

(function() {
    const elFormFilters: HTMLFormElement = document.querySelector(`.filter`);
    const elFormTopbar: HTMLFormElement = document.querySelector(`.topbar__form`);
    const elContentAnimalCards: HTMLDivElement = document.querySelector(`.content__animals`);
    const elContentSponsorCards: HTMLDivElement = document.querySelector(`.content__sponsors`);
    const config: IConfig = {
        cardsOnStorage: `anc_on`,
        cardsOffStorage: `anc_off`,
        cardsOnClass: `card--on`,
        cardsOffClass: `card--off`,
        cardsSortBy: `id-asc`,
        stats: `anc_percentage`
    }

    let dataFilters: IDataFilters = {
        category: [`animal`, `sponsor`]
    };
    let dataCards: IDataCards = _setCardsDefault();
    let dataStats: IDataStats = _setStats();
    let offcanvasID: HTMLDialogElement = undefined;
    
    function _init(): void {
        _registerEvents();
        _displayCards(dataCards.animals, dataCards.sponsors);
        _displayStats(dataStats);
    }

    function _resetAction() {
        (document.querySelector(`#action`) as HTMLInputElement).value = '';
    }

    function _resetMarineWorld() {
        (document.querySelector(`#marineExt`) as HTMLInputElement).checked = false;
    }

    function _resetSort() {
        (document.querySelector(`.dialog__item--id-asc`) as HTMLDivElement).click();
    }

    function _registerEvents(): void {
        (document.querySelectorAll(`.checkbox`) as NodeList).forEach(checkbox => {
            checkbox.addEventListener(`change`, () => {
                _updateCards();
            });
        });

        document.addEventListener(`beforeunload`, () => {
            console.log('x');
        });

        (document.querySelector(`.button--cards`) as HTMLButtonElement).addEventListener(`click`, (ev: Event) => {
            ev.preventDefault();
            
            localStorage.setItem(config.cardsOnStorage, JSON.stringify([]));
            localStorage.setItem(config.cardsOffStorage, JSON.stringify([]));

            _displayCards(dataCards.animals, dataCards.sponsors);
        });

        (document.querySelector(`.button--filter`) as HTMLButtonElement).addEventListener(`click`, () => {
            dataFilters = {};
            
            _resetMarineWorld();
            _resetAction();
            _resetSort();

            dataCards = _setCardsDefault();
            dataStats = _setStats();

            _displayCards(dataCards.animals, dataCards.sponsors);
            _displayStats(dataStats);
        });

        (document.querySelector(`.scroll`) as HTMLDivElement).addEventListener(`click`, (ev: Event) => {
            ev.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        (document.querySelector(`.topbar__reset`) as HTMLDivElement).addEventListener(`click`, (ev: Event) => {
            ev.preventDefault();

            _resetAction();
            _updateCards();
        });

        (document.querySelectorAll(`.topbar__input`) as NodeList).forEach(item => {
            item.addEventListener(`click`, (ev: Event) => {
                ev.preventDefault();

                offcanvasID = document.querySelector(`[data-modal="${(ev.currentTarget as HTMLElement).dataset.option}"]`);
                document.body.classList.add(`_no-scroll`);
                offcanvasID.showModal();
            });
        });

        (document.querySelectorAll(`.dialog__item`) as NodeList).forEach(item => {
            item.addEventListener(`click`, (ev: Event) => {
                if (offcanvasID) {
                    const modalType = ((ev.currentTarget as HTMLElement).closest(`.dialog`) as HTMLDialogElement).dataset.modal;
                    const modalInput: HTMLInputElement = document.querySelector(`#${modalType}`);
                    modalInput.value = (ev.currentTarget as HTMLInputElement).dataset.value;
    
                    if (modalInput.name === `sort`) {
                        config.cardsSortBy = modalInput.value.toLowerCase().trim().replace(/\s/g, '');
    
                        if (config.cardsSortBy === 'conservation') {
                            config.cardsSortBy = `${config.cardsSortBy}-desc`;
                        }
                        
                        if (config.cardsSortBy === 'reputation') {
                            config.cardsSortBy = `${config.cardsSortBy}-desc`;
                        }

                        console.log(config.cardsSortBy);
                    }
    
                    _updateCards();
    
                    document.body.classList.remove(`_no-scroll`);
                    offcanvasID.close();
                }
            });
        });

        document.addEventListener(`click`, (ev: Event) => {
            const el: HTMLElement = (ev.target as HTMLElement);

            if (ev.target === offcanvasID) {
                document.body.classList.remove(`_no-scroll`);
                offcanvasID.close();
            }

            if (el.classList.contains(`overlay`) || el.classList.contains(`topbar__menu`) || el.classList.contains(`header__close`)) {

                document.body.classList.toggle(`_sidebar`);

            } else if (el.classList.contains(`card__image`)) {

                ev.preventDefault();
                const card: HTMLElement = el.closest(`.card`);
                const cardID: number = parseInt(card.dataset.id);

                _promise().then(() => {
                    if (!card.classList.contains(config.cardsOffClass) && !card.classList.contains(config.cardsOnClass)) {
                        _addValueToStorage(config.cardsOnStorage, cardID);
                        card.classList.add(config.cardsOnClass);
                    } else if (card.classList.contains(config.cardsOnClass)) {
                        _addValueToStorage(config.cardsOffStorage, cardID);
                        _removeValueFromStorage(config.cardsOnStorage, cardID);
                        card.classList.remove(config.cardsOnClass);
                        card.classList.add(config.cardsOffClass);
                    } else if (card.classList.contains(config.cardsOffClass)) {
                        _removeValueFromStorage(config.cardsOffStorage, cardID);
                        _removeValueFromStorage(config.cardsOnStorage, cardID);
                        card.classList.remove(config.cardsOffClass);
                    }
                });
                    
            }
        });
    }

    function _promise(time: number = 0): Promise<Number> {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function _setStats(isDefault: boolean = true): Object {
        return {
            animal: isDefault ? 128 : 0,
            sponsor: isDefault ? 64 : 0,
            marineWorld: 0,
            type_1: isDefault ? 30 : 0, 
            type_2: isDefault ? 30 : 0,
            type_3: isDefault ? 29 : 0,
            type_4: isDefault ? 29 : 0,
            type_5: isDefault ? 23 : 0,
            type_6: 0,
            area_1: isDefault ? 27 : 0,
            area_2: isDefault ? 21 : 0,
            area_3: isDefault ? 27 : 0,
            area_4: isDefault ? 21 : 0,
            area_5: isDefault ? 27 : 0,
            size_1: isDefault ? 24 : 0,
            size_2: isDefault ? 31 : 0,
            size_3: isDefault ? 24 : 0,
            size_4: isDefault ? 20 : 0,
            size_5: isDefault ? 19 : 0,
            aviary: isDefault ? 11 : 0,
            small: isDefault ? 10 : 0,
            terrarium: isDefault ? 25 : 0,
            aquarium: 0,
            rock: isDefault ? 25 : 0,
            water: isDefault ? 29 : 0,
            action: isDefault ? '' : '',
        }
    }

    function _setCardsDefault(): IDataCards {
        const animalData = animals.data.filter(item => _filterMarineExt(item));
        const sponsorData = sponsors.data.filter(item => _filterMarineExt(item));

        return {
            animals: _getCardsID(animalData, 'id-asc'),
            sponsors: _getCardsID(sponsorData, 'id-asc'),
        }
    }

    function _filterMarineExt(item: any) {
        return (Array.isArray(dataFilters.extension) && dataFilters.extension.includes(`marineext`)) ? true : !item.marineExt;
    }

    function _getCardsID(dataType: Array<any>, sortBy: string): Array<any> {
        return dataType.sort(_sortByValue(sortBy));
    }

    function _collectCardsData(dataFilters: any): Object {
        dataCards = {
            animals: [],
            sponsors: []
        }

        const animalData = animals.data.filter(item => _filterMarineExt(item));
        const sponsorData = sponsors.data.filter(item => _filterMarineExt(item));

        _resetCards();

        if (!dataFilters.category) {
            elContentAnimalCards.innerHTML = _displayMessage(`Select at least one card type: <strong>Animals</strong> | <strong>Sponsors</strong>`);
            return dataCards;
        }
        
        if (dataFilters.category.includes('animal')) {
            dataCards.animals = animalData.filter(animal => {
                for (let filter in dataFilters) {
                    if (filter === 'extension') continue;
                    if (dataFilters.hasOwnProperty(filter)) {
                        if (Array.isArray(dataFilters[filter])) {
                            if (filter === 'type') {
                                if (Array.isArray(animal[filter])) {
                                    for (let i = 0; i < (animal[filter] as Array<Number>).length; i++) {
                                        if (dataFilters[filter].includes((animal[filter] as Array<Number>)[i])) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                            }
                            if (!dataFilters[filter].includes((animal as any)[filter])) {
                                return false;
                            }
                        } else {
                            if (dataFilters[filter] !== (animal as any)[filter]) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }).sort(_sortByValue(config.cardsSortBy));
        }

        if (dataFilters.category.includes('sponsor')) {
            if (Object.keys(dataFilters)?.length === 1 || (Object.keys(dataFilters).includes(`category`) && Object.keys(dataFilters).includes(`extension`) && Object.keys(dataFilters)?.length === 2)) {
                dataCards.sponsors = sponsorData;
            } else {
                Object.entries(sponsorData).forEach(element => {
                    for (const property in dataFilters) {
                        if (property === `category` || !dataFilters || dataFilters[`action`]) continue;
                        if (property === 'type') {
                            if (Array.isArray(element[1][property])) {
                                for (let i = 0; i < (element[1][property] as Array<Number>).length; i++) {
                                    if ((dataFilters[property as keyof typeof dataFilters] as Array<Number>)?.includes((element[1][property] as Array<Number>)[i])) {
                                        if (!dataCards.sponsors.some(obj => obj.id === element[1][`id`])) {
                                            dataCards.sponsors.push(element[1]);
                                        }
                                    }
                                }
                            }
                        }
                        if ((dataFilters[property as keyof typeof dataFilters] as any)?.includes((element[1] as any)[property])) {
                            if (!dataCards.sponsors.some(obj => obj.id === element[1][`id`])) {
                                dataCards.sponsors.push(element[1]);
                            }
                        }
                    }
                });
                dataCards.sponsors;
            }
        }
        
        return dataCards;
    }

    function _collectStats(dataAnimals: Array<Number>, dataSponsors: Array<Number>): void {
        dataStats = _setStats(false);

        if (dataAnimals) {
            dataAnimals.forEach(elem => {
                const item = animals.data.filter(obj => {
                    // @ts-ignore
                    return obj[`id`] === +elem[`id`];
                });

                if (item[0][`category`] === `animal`) dataStats[`animal`]++;
                if (item[0][`marineExt`]) dataStats[`marineWorld`]++;
                if (item[0][`type`]) {
                    if (Array.isArray(item[0][`type`])) {
                        (item[0][`type`] as Array<number>).forEach((el) => {
                            dataStats[`type_${el}`]++;
                        });
                    } else {
                        dataStats[`type_${item[0][`type`]}`]++;
                    }
                }
                if (item[0][`area`]) dataStats[`area_${item[0][`area`]}`]++;
                if (item[0][`size`]) dataStats[`size_${item[0][`size`]}`]++;

                item[0][`aviary`] ? dataStats[`aviary`]++ : '';
                item[0][`terrarium`] ? dataStats[`terrarium`]++ : '';
                item[0][`aquarium`] ? dataStats[`aquarium`]++ : '';
                item[0][`isRock`] ? dataStats[`rock`]++ : '';
                item[0][`isWater`] ? dataStats[`water`]++ : '';
                item[0][`isPet`] ? dataStats[`small`]++ : '';
            });
        }

        if (dataSponsors) {
            dataSponsors.forEach(elem => {
                const item = sponsors.data.filter(obj => {
                    // @ts-ignore
                    return obj[`id`] === +elem[`id`];
                });

                if (item[0][`category`] === `sponsor`) dataStats[`sponsor`]++;
                if (item[0][`marineExt`]) dataStats[`marineWorld`]++;
                if (item[0][`type`] != 0) dataStats[`type_${item[0][`type`]}`]++;
                if (item[0][`area`] != 0) dataStats[`area_${item[0][`area`]}`]++;
                
                item[0][`isRock`] ? dataStats[`rock`]++ : '';
                item[0][`isWater`] ? dataStats[`water`]++ : '';
            });
        }
    }

    function _sortByValue(sortBy: string | number = `id-desc`) {
        const sortValue = sortBy.toString().split('-');

        return function(a: any, b: any): number {
            if (a[sortValue[0]] === b[sortValue[0]]) return 0;
            if (sortValue[1] && sortValue[1] === `desc`) {
                return (a[sortValue[0]] > b[sortValue[0]]) ? -1 : 1;
            } else {
                return (a[sortValue[0]] < b[sortValue[0]]) ? -1 : 1;
            }
        }
    };

    function _displayStats(data: Object): void {
        // TODO: Add percentage stats & switcher
        const isPercentageStats = false;
        const isMarineWorld: boolean = (Array.isArray(dataFilters.extension) && dataFilters.extension.includes(`marineext`)) ? true : false;
        const numberOfCards: number = isMarineWorld ? 240 : 192;

        Object.entries(data).forEach(([key, value]) => {
            if (key.indexOf(`,`) === -1) {
                const el: HTMLDivElement = document.querySelector(`[data-${key}]`);

                if (el) {
                    const statValue = isPercentageStats ? `${((value / numberOfCards) * 100).toFixed(1)}%` : `${value}x`;
                    el.innerHTML = statValue;
                }
            }
        });
    }

    function _displayCards(dataAnimals: Array<Number>, dataSponsors: Array<Number>): void {  
        let animalCardsMarkup: string = '';
        let sponsorCardsMarkup: string = '';

        if (dataAnimals?.length) {
            for (const card in dataAnimals) {
                animalCardsMarkup += _card((dataAnimals as any)[card][`id`]);
            }
            elContentAnimalCards.innerHTML = animalCardsMarkup;
        } else if ((dataFilters?.category as Array<String>)?.includes(`animal`)) {
            elContentAnimalCards.innerHTML = _displayMessage(`No animals matched`);
        }

        if (dataSponsors?.length) {
            for (const card in dataSponsors) {
                sponsorCardsMarkup += _card((dataSponsors as any)[card][`id`]);
            }
            elContentSponsorCards.innerHTML = sponsorCardsMarkup;
        } else if ((dataFilters?.category as Array<String>)?.includes(`sponsor`)) {
            elContentSponsorCards.innerHTML = _displayMessage(`No sponsors matched`);
        }
    }

    function _displayMessage(message: string = null): string {
        return message ? `<p class="content__message">${message}</p>` : ``;
    }

    function _updateCards(): void {
        dataFilters = {};
    
        _promise().then(() => {
            const filtersData: FormData = new FormData(elFormFilters);

            for (const [key, value] of filtersData) {
                const objValue = isNaN(value as any) ? value : +value;

                if (!key || !value) continue;
                if (dataFilters.hasOwnProperty(key)) {
                    (dataFilters as any)[key].push(objValue);
                } else {
                    Object.assign(dataFilters, {[key]: [objValue]});
                }
            }

            const topbarData: FormData = new FormData(elFormTopbar);

            for (const [key, value] of topbarData) {
                let objValue: string | number;

                if (!key || key === 'sort' || !value) continue;
                if (isNaN(value as any)) {
                    objValue = (value as string).replace(/\s/g, `-`).toLowerCase();
                } else {
                    objValue = +value;
                }
                
                if (dataFilters.hasOwnProperty(key)) {
                    (dataFilters as any)[key].push(objValue);
                } else {
                    Object.assign(dataFilters, {[key]: [objValue]});
                }
            }

            _collectCardsData(dataFilters);
            _collectStats(dataCards.animals, dataCards.sponsors);
            _displayCards(dataCards.animals, dataCards.sponsors);
            _displayStats(dataStats);
        });
    }

    function _resetCards(): void {
        elContentAnimalCards.innerHTML = '';
        elContentSponsorCards.innerHTML = '';
    }

    function _card(id: number): string {       
        let cardStatus = '';
        let cardType = '';

        if (id >= 401 && id <= 560) {
            cardType = 'animal';
        } else if (id >= 201 && id <= 280) {
            cardType = 'sponsor';
        }

        const cardsOn = JSON.parse(localStorage.getItem(config.cardsOnStorage));
        const cardsOff = JSON.parse(localStorage.getItem(config.cardsOffStorage));

        if (cardsOn && cardsOn.includes(+id)) {
            cardStatus = ` ${config.cardsOnClass}`;
        } else if (cardsOff && cardsOff.includes(+id)) {
            cardStatus = ` ${config.cardsOffClass}`;
        }

        return `
            <div class="card card--${cardType}${cardStatus}" data-id="${id}">
                <img src="./dist/images/${cardType}/${id}.jpg" class="card__image" loading="lazy" />
                <div class="card__id">${id}</div>
            </div>
        `;
    }

    function _addValueToStorage(key: string, id: number | boolean): void {
        const values = JSON.parse(localStorage.getItem(key)) || [];

        if (!values.includes(id)) {
            values.push(id);
            localStorage.setItem(key, JSON.stringify(values));
        };
    }

    function _removeValueFromStorage(key: string, id: number): void {
        const values = JSON.parse(localStorage.getItem(key)) || [];
        
        if (values.includes(id)) {
            values.splice(values.indexOf(id), 1);
            localStorage.setItem(key, JSON.stringify(values));
        };
    }

    _init();
}());