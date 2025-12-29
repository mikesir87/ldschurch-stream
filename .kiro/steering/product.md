Product Overview (product.md) - Defines your product's purpose, target users, key features, and business objectives. This helps Kiro understand the "why" behind technical decisions and suggest solutions aligned with your product goals.

# LDSChurch.Stream

This application is a tool to help congregations of The Church of Jesus Christ of Latter-Day Saints provide YouTube streams of their sacrament meetings. It does so by abstracting away the logistics of managing a YouTube channel and simplifying reporting, while keeping compliance with the guidelines established by the LDS church (which are listed below).

Notably, this application is _not_ an official product of The Church of Jesus Christ of Latter-Day Saints.

## Primary users

There are two primary users of this system:

1. **Stream specialists** - these are the individuals assigned in each congregation to actually run the stream. They ensure the meetings are scheduled, hook up their computer to the camera and audio feeds in the building, run OBS to actually run the stream, use the remote controller capabilites of this system to switch scenes and control the stream, and share reports with the local leadership.

   To provide redundancy (in case of sickness, vacation, travel, etc.), there is likely going to be at least two different stream specialists within a single unit.

2. **Stream attendees** - these are those that watch the stream. Many of these individuals are not technically savvy and need things to work as simply as possible.

3. **Local leadership** - these are those that are interested in keeping track of who is attending the streams. They are likely not going to use the system itself, but need the reports from the stream specialists. Their desire to keep track is mostly to assist and minister to those in need (who might be unable to attend and might need an additional hand?)

Additionally, there is a _global admin_ role that is able to see and manage all units, including having the ability to create new units and assign stream specialists to the units.

## The system components

The application is composed of three user-facing components - the landing page, stream dashboard, and stream access - and a backing REST API.

### Landing page

The landing page serves as the main marketing and informational site for LDSChurch.Stream. It provides an overview of the service, key features, frequently asked questions, and a login button that directs stream specialists to the dashboard. This page is publicly accessible and helps potential users understand the service before getting started.

The landing page includes:

- Hero section explaining the service's purpose
- About section detailing how it helps LDS congregations
- Features showcase highlighting key capabilities
- FAQ section addressing common questions
- Contact information and support details
- Login/Get Started call-to-action button

This app is available at https://ldschurch.stream

### Stream dashboard

The stream dashboard is only used by the _stream specialists_. Upon opening the dashboard, a stream specialist is able to manage the streams for their assigned unit. This includes scheduling streams, viewing attendance reports, and configuring emails of _local leadership_ to send automated reports.

The stream dashboard also provides the ability to see attendance over time using trend graphs and tables. The reporting provides the ability to search for a specific name and see what week(s) they might have attended. The purpose of this is to help identify those that might need to ministered to (in case they haven't visited in-person for a while).

As of right now, this dashboard is not managing any aspects of the stream itself (connecting OBS, managing scenes, etc.).

The _stream specialists_ can enter email addresses for _local leadership_, who will be automatically sent emails on Monday morning containing a report of the individuals that attended the streams.

This app is available at https://dashboard.ldschurch.stream

### Stream access app

This app is used by _stream attendees_ to actually access the live stream for the week. Each unit has its own unique URL, making it easy for local church members to have a consistent URL. Upon opening the page, the attendee is given a form to fill out to provide their name and the number of attendees. After completing the form, they are forwarded to the YouTube stream for that unit for that week.

On weeks that have no stream (maybe due to stake or general conferences), the app provides a message configured by the _stream specialist_ for the week.

No authentication is required for this site, as it is open to the public.

An example domain might be https://blacksburg-va.ldschurch.stream, which will provide the form for the Blacksburg, VA ward.

### REST API

This API provides the backbone for all of the other components and is the only service that interacts directly with the database. All other components interact with this API to get and store data, etc.

## Onboarding new units

Since this application is just starting, we are not including a self-serve enrollment process. Instead, the _global admin_ user can create a new unit. From there, they are given a short-lived invite link that can be sent out. Upon visiting the link and authenticating, the user is assigned as a stream specialist for the new unit.

## Church guidelines

The following guidelines are provided by the LDS Church and MUST be followed:

- Stream recordings of ward and stake meetings should be deleted within one day after the meeting.
  - Implications - the stream access app should not forward someone to a stream 24 hours after it has been completed

- The ordinance of the sacrament is not streamed. If a sacrament meeting is being livestreamed, the stream should be paused during the administration of the sacrament.
  - Implications - when we get to the point of providing OBS scenes, we need to provide the ability to "pause" the stream

- Streaming of ordinances should not distract from the Spirit. Generally, only one device should be used. It is operated by the ward or stake technology specialist. Both the device and the person using it should be inconspicuous.
  - Implications - when we get to the point of helping manage OBS, we want to allow the stream specialist to control the stream with minimal disruption and able to sit with their family in the congregation.

## Definitions

- **Unit** - a unit is a single term to capture a pre-existing congregation of the LDS Church. These units might be wards, branches, or even stakes within the church. For the purposes of this app, it's simply a name for a congregation that is providing streams of their services.

## Key features

- YouTube stream setup and management
  - The LDSChurch.Stream systems utilizes a single YouTube channel, reducing the need for each congregation to setup and manage their own channel

## Key decisions

- YouTube is being used, instead of Zoom, because it is easier for stream attendees. Most folks have YouTube already installed and can easily open a link. In addition, attendees can easily put the stream onto their televisions or other devices, which is difficult using Zoom.

## Stream workflow

### Stream preparation

The first is the prep work to schedule the weekly meeting, in which the _stream specialist_ (most likely a few days before):

1. Log into the stream dashboard
2. Ensures they are viewing the dashboard for the unit they are wanting to manage (in case they are associated with multiple units)
3. Creates a new stream event for the next Sunday sacrament meeting

- This simply requires setting the date and time for the stream to start
- The system creates a database record with `pending` status
- A batch job (running every 4 hours) will create the YouTube Live event and update the status to `scheduled`
  - The Live event is enabled to auto-start and auto-stop
  - The Live event is published as an Unlisted event

4. During event creation, the specialist is also able to indicate the week's event is a non-stream event to cover special circumstances (like stake or general conference). When this option is selected, the specialist is able to provide a message that will then be displayed to attendees (e.g. "No stream this week due to Stake Conference").

Note that the specialist could schedule multiple events at a time, allowing them to batch schedule (schedule all events at the beginning of the month as an example).

### Stream running

When the _stream specialist_ is ready to go live with the stream, they will:

1. Start OBS with its configured scenes and config (outside the scope of this app)
2. Retrieve the stream key from the stream dashboard
3. Start the stream using OBS

In the case that a stream is failing (maybe due to technical issues like the WiFi being down at the church), the _stream specialist_ can update the scheduled event to become a non-streaming event where they can enter a message that will be displayed to the attendees.

### Stream attendance

A _stream attendee_ can open the stream access app at any time throughout the week. However, what they see will vary.

If they do so on a day in which there is no stream, they will be greeted with a message indicating when the next stream will be available. If the next Sunday event is a special event (stake or general conference), they will be notified of this (e.g. "No stream this week due to Stake Conference").

On the day of the event, they will be prompted with a form to provide their name and number of attendees, after which they will be forwarded to the stream (even if it isn't live yet). If the stream is still being prepared (pending YouTube creation), they will see a message indicating the stream is being set up. If the same family opens the app multiple times and submits the name multiple times, the dashboard does not try to consolidate the submissions.

Privacy-wise, there's no specific opt-out checkbox or mechanism. If a user doesn't wish to be tracked, they can simply enter a false name into the form. And since there's no backing authentication or identity, there's no way to verify their identity anyways. The submission of names is completely honesty-based.

In the case that no stream was configured and no special case was configured, then they are given a message indicating no stream has been setup.

### Stream reporting and clean-up

Each Monday morning, a cron-like task will run as part of the dashboard's backend that will do the following:

1. Find all streams that ran the previous day
2. Build a comprehensive attendance report that includes:
   - **New this week** - first-time attendees who haven't appeared before
   - **Regular streamers** - names appearing 3+ weeks in a row
   - **Returned after absence** - names that reappeared after being absent
   - **Missing regulars** - names that usually attend but haven't been seen in 2+ weeks
   - **All attendees** - complete alphabetical list with attendee counts
   - **Total attendance trends** - comparison to previous weeks
3. Send the report via email to the unit's listed _local leadership_
4. Delete the YouTube Live event and recording. The event data in the app itself is not deleted to support longer-term reporting capabilities and attendance pattern analysis
