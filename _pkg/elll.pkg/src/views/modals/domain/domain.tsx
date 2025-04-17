import { DomainRecordSet } from "@elllphnt/networking-service-client";
import { Domain } from "@repo/backend";
import { ProgressBar } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useEffect, useRef } from "react";
import { elllPropertyKeys } from "../../../elll/property_keys";
import { ElllServerConfig } from "../../../elll/setup";
import { useElll } from "../../../hooks/elll/elll";

function isApex(domain: string) {
  return domain.split(".").length === 2;
}
function dnsIsConfigured({
  domain,
  records,
  cnameTarget,
  ipAddress,
}: {
  domain: string;
  records?: DomainRecordSet;
  cnameTarget?: string;
  ipAddress?: string;
}) {
  if (isApex(domain) && ipAddress) {
    return !!records?.A?.find(
      (record) =>
        record.name === domain &&
        record.type === "A" &&
        record.data === ipAddress,
    );
  } else if (cnameTarget) {
    return !!records?.CNAME?.find(
      (record) =>
        record.name === domain &&
        record.type === "CNAME" &&
        record.data === cnameTarget,
    );
  } else {
    return false;
  }
}

export function DomainView({ domain }: { domain: Domain }): JSX.Element {
  const elll = useElll();
  const provisionCountRef = useRef(0);
  const records = useObservable(domain.records$, domain.records);
  const fetchingRecords = useObservable(
    domain.fetchingRecords$,
    domain.fetchingRecords,
  );
  const fetchingCertificate = useObservable(
    domain.fetchingCertificate$,
    domain.fetchingCertificate,
  );
  const certificate = useObservable(
    domain.certificate$(true),
    domain.certificate(true),
  );
  const certificateReady = useObservable(
    certificate?.ready$,
    certificate?.ready,
  );
  const certificateStatus = useObservable(
    certificate?.status$,
    certificate?.status,
  );
  const certificateProvisioning = useObservable(
    certificate?.provisioning$,
    certificate?.provisioning,
  );
  const deleting = useObservable(domain.deleting$, domain.deleting);

  useEffect(() => {
    domain.fetchRecords();
    const interval = setInterval(() => {
      domain.fetchRecords();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [domain.name]);

  const elllServerConfig = useObservable(
    elll.properties.value$<ElllServerConfig>(elllPropertyKeys.elllServerConfig),
    elll.properties.value<ElllServerConfig>(elllPropertyKeys.elllServerConfig),
  );

  const dnsConfigured = domain.name.endsWith(
    `.${elllServerConfig?.fallbackDomain}`,
  )
    ? true
    : dnsIsConfigured({
        domain: domain.name,
        records: records,
        cnameTarget: elllServerConfig?.cnameTarget,
        ipAddress: elllServerConfig?.ipAddress,
      });

  useEffect(() => {
    if (
      dnsConfigured &&
      certificate &&
      !certificate.ready &&
      !certificate.provisioning &&
      provisionCountRef.current < 5
    ) {
      certificate.provision();
      provisionCountRef.current++;
    }
  }, [certificate, dnsConfigured]);

  let content = <></>;
  let tag = <></>;
  let dnsRecords = <></>;

  if (!records) {
    tag = <div className="el-text-fg">Loading...</div>;
  } else if (dnsConfigured) {
    if (certificateReady) {
      content = (
        <div>
          <p>This domain is ready to serve traffic.</p>
        </div>
      );
      tag = <div className="el-text-green">Ready</div>;
    } else if (fetchingCertificate) {
      tag = (
        <div className="el-text-yellow">Checking for SSL certificate...</div>
      );
    } else if (certificateProvisioning) {
      tag = <div className="el-text-yellow">Issuing SSL certificate...</div>;
    } else if (certificateStatus) {
      tag = (
        <div className="el-text-yellow">
          SSL certificate {certificateStatus.toLocaleLowerCase()}...
        </div>
      );
    } else {
      tag = <div className="el-text-red">SSL certificate not issued</div>;
    }
  } else {
    if (isApex(domain.name)) {
      dnsRecords = (
        <tr
          className="el-font-mono el-h-7"
          style={{
            userSelect: "text",
          }}
        >
          <td>A</td>
          <td>{elllServerConfig?.ipAddress}</td>
        </tr>
      );
    } else {
      dnsRecords = (
        <tr
          className="el-font-mono el-h-7"
          style={{
            userSelect: "text",
          }}
        >
          <td>CNAME</td>
          <td>{elllServerConfig?.cnameTarget}</td>
        </tr>
      );
    }

    content = (
      <div className="el-space-y-3">
        <p>Please add the following records to your DNS settings:</p>
        <p>
          If you have already added these records, it might take a few minutes
          for them to propagate.
        </p>

        <table
          onContextMenu={(e) => {
            e.stopPropagation();
          }}
        >
          <tbody>
            <tr className="el-text-fg">
              <td style={{ width: 80 }}>Type</td>
              <td>Value</td>
            </tr>

            {dnsRecords}
          </tbody>
        </table>
      </div>
    );
    tag = <div className="el-text-red">Not configured</div>;
  }

  const working = fetchingRecords || certificateProvisioning || deleting;

  return (
    <div
      className="el-space-y-2"
      style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        width: 300,
        height: 400,
      }}
    >
      <div className="el-space-y-1">
        <div className="el-text-fg-800 el-font-bold el-text-lg">
          {dnsConfigured ? (
            <a href={`https://${domain.name}`} target="_blank" rel="noreferrer">
              {domain.name}↗
            </a>
          ) : (
            `${domain.name}`
          )}
        </div>
        {tag}
      </div>
      <div style={{ position: "relative" }}>
        <hr />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: working ? 1 : 0,
            transition: "opacity 0.5s",
            // transitionDelay: working ? "0.5s" : "0s",
          }}
        >
          <ProgressBar height={1} />
        </div>
      </div>
      <div
        className="el-py-2 grow el-gap-3"
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {content}
      </div>
      <hr />
      <div className="el-flex el-justify-end">
        <button
          onClick={async () => {
            await domain.delete();
            elll.shell.hideModal();
          }}
          className="el-h-7 el-px-3 el-rounded el-bg-red/20 hover:el-bg-red/40 el-text-pm-ctr"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
