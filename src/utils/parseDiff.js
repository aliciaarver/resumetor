export function buildParseDiff(before, after) {
    const blocks = [
        diffPersonal(before, after),
        diffTextBlock('aboutMe', before.aboutMe, after.aboutMe),
        diffArrayBlock('workExperience', before.workExperience, after.workExperience),
        diffArrayBlock('education', before.education, after.education),
        diffArrayBlock('skills', before.skills, after.skills),
        diffArrayBlock('languages', before.languages, after.languages),
        diffArrayBlock('projects', before.projects, after.projects),
    ];
    return {
        totalChanges: blocks.reduce((sum, block) => sum + block.changeCount, 0),
        blocks,
    };
}
function diffPersonal(before, after) {
    let changeCount = 0;
    let addedCount = 0;
    let removedCount = 0;
    const beforeName = before.personal.fullName.trim();
    const afterName = after.personal.fullName.trim();
    if (beforeName !== afterName) {
        changeCount += 1;
        if (!beforeName && afterName)
            addedCount += 1;
        if (beforeName && !afterName)
            removedCount += 1;
    }
    const beforePhone = before.personal.phone.trim();
    const afterPhone = after.personal.phone.trim();
    if (beforePhone !== afterPhone) {
        changeCount += 1;
        if (!beforePhone && afterPhone)
            addedCount += 1;
        if (beforePhone && !afterPhone)
            removedCount += 1;
    }
    const personalFields = [
        [before.personal.firstName.trim(), after.personal.firstName.trim()],
        [before.personal.lastName.trim(), after.personal.lastName.trim()],
        [before.personal.middleName.trim(), after.personal.middleName.trim()],
        [before.personal.position.trim(), after.personal.position.trim()],
        [before.personal.location.trim(), after.personal.location.trim()],
        [before.personal.citizenship.trim(), after.personal.citizenship.trim()],
        [before.personal.workPermit.trim(), after.personal.workPermit.trim()],
        [before.personal.birthDate.trim(), after.personal.birthDate.trim()],
        [before.personal.gender.trim(), after.personal.gender.trim()],
        [before.personal.age.trim(), after.personal.age.trim()],
        [before.personal.photo.trim(), after.personal.photo.trim()],
    ];
    for (const [beforeValue, afterValue] of personalFields) {
        if (beforeValue !== afterValue) {
            changeCount += 1;
            if (!beforeValue && afterValue)
                addedCount += 1;
            if (beforeValue && !afterValue)
                removedCount += 1;
        }
    }
    const formatsDiff = diffArrayBlock('personal', before.personal.workFormats, after.personal.workFormats);
    changeCount += formatsDiff.changeCount;
    addedCount += formatsDiff.addedCount;
    removedCount += formatsDiff.removedCount;
    const linksDiff = diffArrayBlock('personal', before.personal.links, after.personal.links);
    changeCount += linksDiff.changeCount;
    addedCount += linksDiff.addedCount;
    removedCount += linksDiff.removedCount;
    return {
        key: 'personal',
        changed: changeCount > 0,
        changeCount,
        addedCount,
        removedCount,
    };
}
function diffTextBlock(key, before, after) {
    const changed = before.trim() !== after.trim();
    return {
        key,
        changed,
        changeCount: changed ? 1 : 0,
        addedCount: !before.trim() && after.trim() ? 1 : 0,
        removedCount: before.trim() && !after.trim() ? 1 : 0,
    };
}
function diffArrayBlock(key, before, after) {
    const beforeComparable = before.map(toComparableValue);
    const afterComparable = after.map(toComparableValue);
    const beforeMap = new Map(beforeComparable.map((value) => [value, (beforeMapCount(beforeComparable, value))]));
    const afterMap = new Map(afterComparable.map((value) => [value, (beforeMapCount(afterComparable, value))]));
    const keys = new Set([...beforeMap.keys(), ...afterMap.keys()]);
    let addedCount = 0;
    let removedCount = 0;
    for (const value of keys) {
        const beforeCount = beforeMap.get(value) ?? 0;
        const afterCount = afterMap.get(value) ?? 0;
        if (afterCount > beforeCount)
            addedCount += afterCount - beforeCount;
        if (beforeCount > afterCount)
            removedCount += beforeCount - afterCount;
    }
    const changed = addedCount > 0 || removedCount > 0;
    return {
        key,
        changed,
        changeCount: addedCount + removedCount,
        addedCount,
        removedCount,
    };
}
function beforeMapCount(values, target) {
    return values.filter((value) => value === target).length;
}
function toComparableValue(value) {
    if (!value || typeof value !== 'object') {
        return String(value ?? '');
    }
    const entries = Object.entries(value)
        .filter(([key]) => key !== 'id')
        .map(([key, entryValue]) => [key, typeof entryValue === 'string' ? entryValue.trim() : entryValue])
        .sort((left, right) => String(left[0]).localeCompare(String(right[0])));
    return JSON.stringify(entries);
}
