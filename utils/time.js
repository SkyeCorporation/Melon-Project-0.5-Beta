const DEFAULT_TIME_ZONE = process.env.TZ || "UTC";

function getDateParts(value, timeZone = DEFAULT_TIME_ZONE) {
	const date = value instanceof Date ? value : new Date(value ?? Date.now());
	if (Number.isNaN(date.getTime()))
		throw new RangeError("Invalid date value");

	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23"
	});
	const parts = Object.fromEntries(formatter.formatToParts(date)
		.filter(part => part.type !== "literal")
		.map(part => [part.type, part.value]));

	const offsetPart = new Intl.DateTimeFormat("en-US", {
		timeZone,
		timeZoneName: "longOffset",
		hour: "2-digit"
	}).formatToParts(date).find(part => part.type === "timeZoneName");
	const offset = offsetPart?.value || "GMT";
	parts.offset = offset === "GMT" ? "+00:00" : offset.replace(/^GMT/, "");
	parts.millisecond = String(date.getUTCMilliseconds()).padStart(3, "0");
	return parts;
}

function formatDate(value, format = "YYYY-MM-DDTHH:mm:ssZ", timeZone = DEFAULT_TIME_ZONE) {
	const parts = getDateParts(value, timeZone);
	const tokens = {
		YYYY: parts.year,
		YY: parts.year.slice(-2),
		MM: parts.month,
		M: String(Number(parts.month)),
		DD: parts.day,
		D: String(Number(parts.day)),
		HH: parts.hour,
		H: String(Number(parts.hour)),
		mm: parts.minute,
		m: String(Number(parts.minute)),
		ss: parts.second,
		s: String(Number(parts.second)),
		SSS: parts.millisecond,
		Z: parts.offset
	};
	return format.replace(/YYYY|SSS|YY|MM|DD|HH|mm|ss|M|D|H|m|s|Z/g, token => tokens[token]);
}

function nowISO(timeZone = DEFAULT_TIME_ZONE) {
	return formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ssZ", timeZone);
}

module.exports = {
	formatDate,
	nowISO
};